<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SimpleEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $emailData;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(array $emailData)
    {
        $this->emailData = $emailData;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        // Préparer les détails pour le template markdown (comme SendActivitesRecuEmail)
        $details = [
            'content' => $this->emailData['content'],
            'subject' => $this->emailData['subject'],
            'variables' => $this->emailData['variables'] ?? [],
            'rawHtml' => $this->emailData['rawHtml'] ?? false,
            'dashboard_url' => $this->emailData['variables']['{dashboard_url}'] ?? 'https://epavillonclimatique.francophonie.org/events/dashboard',
            'recipient_name' => $this->emailData['variables']['{recipient_name}'] ?? null,
            'organization_name' => $this->emailData['variables']['{organization_name}'] ?? 'IFDD',
        ];

        // Utiliser markdown au lieu de view (comme SendActivitesRecuEmail)
        return $this->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject($this->emailData['subject'])
                    ->markdown('emails.polivalent.simple_email')
                    ->with('details', $details);
    }
}