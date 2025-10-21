<template>
  <!--
    :time-step="30"
    show-time-in-cells
    :min-date="minDate"
    :max-date="maxDate"
   -->
    <div class="h-[95vh]">
        <div class="flex justify-center bg-ifdd-green3">
            <select @change="updateEventsCopie()" class="text-sm w-60 h-10 rounded-md focus:outline-none border-green-custom"
                v-model="evenType">
                <option :value="'tout'">Tout les évènements ({{this.events.length}})</option>
                <option :value="'valide'">Evènements validés ({{this.events.filter(event => event.class == 'valide').length}})</option>
                <option :value="'attente'"> Evènements en attente ({{this.events.filter(event => event.class == 'attente').length}})</option>
                <option :value="'invalide'">Evènements invalidés ({{this.events.filter(event => event.class == 'invalide').length}})</option>
                <option :value="'annule'">Annulé ({{this.events.filter(event => event.class == 'annule').length}})</option>
            </select>
        </div>
        <vue-cal
          ref="vuecal"
          events-count-on-year-view
          :disable-views="['years']"
          v-model:active-view="activeView"
          selected-date="2024-11-01"
          :time-cell-height="70"
          today-button
          active-view="year"
          :time-from="7 * 60"
          :time-to="20 * 60"
          :editable-events="{ drag: true, resize: true, create: false }"
          :events="eventsCopie"
          :snap-to-time="15"
          locale="fr"
          :special-hours="specialHours"
          @event-duration-change="onEventDurationChange"
          @event-drop="onEventDrop"
          class=" bg-white">
          <template #event="{ event, view }">
              <!-- <div class="vuecal__event-title" v-html="event.title" /> -->
              <!-- Or if your events are editable: -->
              <div @dblclick="sendShowEven(event.evenement)" @mouseenter="activiteHover = event" @mouseleave="activiteHover = null" :title="event.title" class="vuecal__event-title rounded-md bg-gradient-to-tr from-blue-700 to-ifdd-green3 truncate shadow-md"
                  @blur="event.title = $event.target.innerHTML"
                  v-html="event.title" />

              <small class="vuecal__event-time relative">
                  <!-- Using Vue Cal Date prototypes (activated by default) -->
                  <div class="font-bold" title="">{{ event.start.format("DD/MM/YYYY HH:mm-") + event.end.formatTime("HH:mm") }}</div>
                  <div @mouseenter="ancienneDateHover = event.id" @mouseleave="ancienneDateHover = null" class="line-through italic relative" v-if="(event.start.format('DD/MM/YYYY HH:mm') != event.start_proposed.format('DD/MM/YYYY HH:mm')) || (event.end.format('DD/MM/YYYY HH:mm') != event.end_proposed.format('DD/MM/YYYY HH:mm'))" :title="'Date du soumissionnaire ' + event.start_proposed.format('DD/MM/YYYY HH:mm-') + event.end_proposed.formatTime('HH:mm')">
                    <!-- <img @click="resetDate(event)" v-if="ancienneDateHover == event.id" class="h-5 w-5 absolute left-0 bg-white p-1 rounded-full cursor-pointer hover:bg-blue-500 active:duration-75 active:bg-blue-400 transition-all duration-700" src="/images/icons/reset1.png" alt=""> -->
                    {{ event.start_proposed.format("DD/MM/YYYY HH:mm-") + event.end_proposed.formatTime(" HH:mm") }}
                  </div>
                  <!-- <strong>Event start:</strong> <span >{{ event.start.formatTime("h O'clock") }}</span><br/>
                  <strong>Event end:</strong> <span>{{ event.end.formatTime("h O'clock") }}</span> -->
              </small>
          </template>
        </vue-cal>

        <div :class="activiteHover ? 'top-20 left-0 right-0' : '-top-20 left-0 right-0'" class="flex h-14 transition-all bg-white rounded-xl px-3 absolute top-10 shadow-md w-4/12 justify-between mx-auto">
          <img v-if="activiteHover" class=" w-28" :src=" '/' + activiteHover?.logo_url" alt="">
          <div class="border-l border-r border-gray-400 mx-1 px-1 overflow-hidden line-clamp-2 text-sm">
            <div class=" border-b pb-1 mb-1 truncate">{{activiteHover?.evenement?.coordinateur?.intervenant?.user?.organisation?.statut}}</div>
            <div>{{activiteHover?.title}}</div>
          </div>
          <div class="flex">
            <div class="ml-5"><img class="h-4" src="/images/icons/location_gray.svg" alt=""></div>
            <div class="">{{activiteHover?.localisation}}</div>
          </div>
        </div>

        <button :class="messageSaveAgenda == 'Enregistrement' ? 'hidden' : ''" v-if="agendaValide.length > 0" @click="saveEvents" class="px-3 mt-px font-bold active:bg-yellow-300 hover:bg-yellow-400 bg-ifdd-yellow text-ifdd-green3 shadow-md rounded-md absolute right-1 top-0 border border-ifdd-red flex space-x-2">
          <div>Enregistrer les modifications</div>
          <div class="rounded-full bg-ifdd-green3 p-1 text-ifdd-yellow h-7 font-extrabold">{{agendaValide.length}}</div>
        </button>
        <div  v-if="messageSaveAgenda == 'Enregistrement'" class="absolute right-1 top-0 bg-ifdd-yellow">
            <img class="h-10 w-10 m-auto animate-spin" src="/images/icons/load3.png" alt="">
        </div>
        <div v-else>
          <div v-if="messageSaveAgenda" class="absolute right-1 top-1 px-3 py-1 font-bold text-white rounded-md" :class="messageSaveAgenda == 'Enregistré' ? 'bg-green-500' : (messageSaveAgenda == 'Erreur' ? 'bg-red-600' : ' bg-white')"> {{messageSaveAgenda}}</div>
        </div>
    </div>
</template>

<script>
import VueCal from 'vue-cal';
import 'vue-cal/style.css';
import { inject } from 'vue';
import { update } from 'lodash';

export default {
  components: { VueCal },
  props: ['evenements'],
  emits: ['send-show-even'],
  // Using Vue Cal Date Prototypes (activated by default).
  data(){

    return {
    agendaValide: [],
    // saveEvents:{
    //   saving: false,
    //   succes: false,
    //   error: false
    // },
    ancienneDateHover: false,
    messageSaveAgenda: null,
    activiteHover: false,
    activeView: 'year',
    selectedEvent: {},
    evenType: 'tout',
    events: [],
    eventsCopie: [],
    specialDates:{
      date: '2023-11-07',
        class: 'closed',
        label: 'Fermé'
    },
    // specialHours: {
    //   7: {
    //     from: 7 * 60,
    //     to: 20 * 60,
    //     class: 'closed',
    //     label: 'Fermé'
    //   }
    // }
}
  },
  methods: {
    updateEventsCopie(){
      // console.log(this.evenType);
      if(this.evenType == 'tout'){
        this.eventsCopie = this.events;
      }else{
        this.eventsCopie = this.events.filter(event => event.class == this.evenType);
      }
    },
    resetDate(event){
      this.messageSaveAgenda = null;
      const event_id = event.id;
      this.agendaValide = this.agendaValide.filter(objet => objet.id_evenement !== event.id);
      this.agendaValide.push({
        id_evenement: event.id,
        date_debut_valide_timestamp: event.start_proposed.format('YYYY/MM/DD HH:mm'),
        date_fin_valide_timestamp: event.end_proposed.format('YYYY/MM/DD HH:mm'),
      });

      const index = this.events.findIndex(event => event.id == event_id);

      if (index !== -1) {
        this.events[index].start = event.start_proposed.format('YYYY/MM/DD HH:mm');
        this.events[index].end = event.end_proposed.format('YYYY/MM/DD HH:mm');
      } else {
        console.error("Aucun événement trouvé avec l'ID "+ event.id);
      }
    },
    onEventDurationChange(event) {
      this.messageSaveAgenda = null;
      const oldEven = this.events.find(objet => objet.id === event.event.id);

      this.agendaValide = this.agendaValide.filter(objet => objet.id_evenement !== event.event.id);
      if((this.createDate(oldEven.end).getTime() != event.event.end.getTime())){
        this.agendaValide.push({
          id_evenement: event.event.id,
          date_debut_valide_timestamp: event.event.start.format('YYYY/MM/DD HH:mm'),
          date_fin_valide_timestamp: event.event.end.format('YYYY/MM/DD HH:mm')
        });
      }
    },

    onEventDrop(event) {

      this.messageSaveAgenda = null;

      const oldEven = this.events.find(objet => objet.id === event.event.id);
      // console.log(this.createDate(oldEven.start).getTime(), event.event.start.getTime());

      this.agendaValide = this.agendaValide.filter(objet => objet.id_evenement !== event.event.id);
      if(this.createDate(oldEven.start).getTime() != event.event.start.getTime()){
        this.agendaValide.push({
          id_evenement: event.event.id,
          date_debut_valide_timestamp: event.event.start.format('YYYY/MM/DD HH:mm'),
          date_fin_valide_timestamp: event.event.end.format('YYYY/MM/DD HH:mm')
        });
      }
    },

    sendShowEven(evenement) {
        this.$emit('send-show-even', evenement);
    },

    saveEvents(){
      this.messageSaveAgenda = 'Enregistrement';
      axios.post(this.route('save.agenda'), {
        agendaValide: this.agendaValide
        }).then(response =>{
            if(response.status === 200){
              this.messageSaveAgenda = 'Enregistré';
              this.agendaValide = [];
            }
        }).catch(e =>{
            // console.log(e);
            this.messageSaveAgenda = 'Erreur';
            this.agendaValide = [];
      });
    },

    createDate(date){
      return new Date(date);
    },

    createEvenements(){

      for (const evenement of this.evenements) {

        let classEven;
        if(evenement.statut_text == null){
          classEven = 'attente';
        }else if(evenement.statut_text == 'non-valide'){
          classEven = 'invalide';
        }else if(evenement.statut_text == 'valide'){
          classEven = 'valide';
        }else if(evenement.statut_text == 'annule'){
          classEven = 'annule';
        }

        this.events.push({
          id: evenement.id,
          // Dates proposés par les organisations
          start_proposed: this.createDate(evenement.date_debut + ' ' + evenement.heure_debut),
          end_proposed: this.createDate(evenement.date_debut + ' ' + evenement.heure_fin),

          // Dates mobiles par le système
          start: evenement.date_debut_valide_timestamp ? evenement.date_debut_valide_timestamp : evenement.date_debut + ' ' + evenement.heure_debut,
          end: evenement.date_fin_valide_timestamp ? evenement.date_fin_valide_timestamp : evenement.date_debut + ' ' + evenement.heure_fin,

          // Dates initiale. Ces dates seront comparé aux dates mobile
          // init_start: evenement.date_debut_valide_timestamp ? evenement.date_debut_valide_timestamp : evenement.date_debut + ' ' + evenement.heure_debut,
          // init_end: evenement.date_fin_valide_timestamp ? evenement.date_fin_valide_timestamp : evenement.date_debut + ' ' + evenement.heure_fin,

          title: evenement.coordinateur?.intervenant?.user?.organisation?.denomination,

          localisation: evenement.pays?.nom,
          logo_url: evenement.coordinateur?.intervenant?.user?.organisation?.logo_url,

          evenement: evenement,
          // invalide
          // invalide
          class: classEven,
          resizable: true,
          draggable: true
        });
      }

      // return events;
    }
  } ,
  computed: {
    minDate () {
      return new Date().subtractDays(10)
    },
    maxDate () {
      return new Date().addDays(10)
    }
  },
  mounted(){

    this.createEvenements();
    this.eventsCopie = this.events;
  },

  created(){
      const emitter = inject("emitter");
      emitter.on("statut_text_change", (value) => {
        // console.log('statut_text_change evenementAgenda');
        const index = this.events.findIndex(event => event.id === value.id);

        let classEven;

        if(value.statut_text == null){
          classEven = 'attente';
        }else if(value.statut_text == 'non-valide'){
          classEven = 'invalide';
        }else if(value.statut_text == 'valide'){
          classEven = 'valide';
        }else if(value.statut_text == 'annule'){
          classEven = 'annule';
        }

        // Vérifier si l'événement a été trouvé
        if (index !== -1) {
        // Mettre à jour la propriété statut_text de l'événement avec l'ID 2
          this.events[index].class = classEven;
        } else {
          console.error("L'événement avec l'ID: "+ value.id +" n'a pas été trouvé.");
        }

        this.updateEventsCopie();
      });
  },
}
</script>


<style>
  .vuecal__event {cursor: pointer;}

  .vuecal__event-title {
    font-size: 0.9em;
    font-weight: bold;
    margin: 0px 0 0px;
  }

  .vuecal__event-time {
    display: inline-block;
    margin-bottom: 2px;
    padding-bottom: 2px;
    /* border-bottom: 1px solid rgba(0, 0, 0, 0.2); */
  }

  .vuecal__event-content {
    font-style: italic;
  }


  /* Different color for different event types. */
  .vuecal__event.leisure {background-color: rgba(253, 156, 66, 0.9);border: 1px solid rgb(233, 136, 46);color: #fff;}
  .vuecal__event.attente {
    background-color: rgba(255, 166, 0, 0.9);
    color: #fff; border-radius: 0.375rem/* 6px */;
    --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
  .vuecal__event.invalide {
    background-color: rgba(255, 0, 0, 0.9);
    color: #fff; border-radius: 0.375rem/* 6px */;
    --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
  .vuecal__event.annule {
    background-color: rgba(60, 55, 55, 0.9);
    color: #fff; border-radius: 0.375rem/* 6px */;
    --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
  .vuecal__event.valide {
    background-color: rgba(32, 135, 25, 0.9);
    color: #fff; border-radius: 0.375rem/* 6px */;
    --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
  /* .vuecal__event.annule {background-color: rgba(255, 0, 0, 0.9);border: 1px solid rgb(235, 82, 82);color: #fff; border-radius: 0.375rem6px;} */


  .vuecal--month-view .vuecal__cell {height: 40px;}

  .vuecal--month-view .vuecal__cell-content {
    justify-content: flex-start;
    height: 100%;
    align-items: flex-end;
  }

  .vuecal--month-view .vuecal__cell-date {padding: 1px;}
  .vuecal--month-view .vuecal__no-event {display: none;}
  /* Supprime le nombre, à revoir */
  /* .vuecal__event {background-color: rgba(76, 172, 175, 0.35);} */

  .vuecal__event.lunch {
    background: repeating-linear-gradient(45deg, transparent, transparent 10px, #f2f2f2 10px, #f2f2f2 20px);/* IE 10+ */
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .vuecal__event.lunch .vuecal__event-time {display: none;align-items: center;}
  .vuecal__time-cell-line.hours:before {border-color: #42b983;}



  .vuecal__special-hours {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;

    em {font-size: 0.9em;color: #999;}
  }

  .doctor-1 {background-color: #f0fff1;color: #81d58b;}
  .doctor-2 {background-color: #f0f6ff;color: #689bee;}
  .doctor-3 {background-color: #fcf0ff;color: #d168ee;}
  .closed {
    background:
      #fff7f0
      repeating-linear-gradient(
        -45deg,
        rgba(255, 162, 87, 0.25),
        rgba(255, 162, 87, 0.25) 5px,
        rgba(255, 255, 255, 0) 5px,
        rgba(255, 255, 255, 0) 15px
      );
    color: #ff0000;
  }

  .vuecal__header {
    background-color: #255033;
    color: white;
    border-bottom-right-radius: 30px;;
    border-bottom-left-radius: 30px;;
    border: 1px solid #255033;
  }

  .vuecal__month {
    height: 80px; /* Adjust the height as needed */
  }
</style>
