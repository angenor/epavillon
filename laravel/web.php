<?php
use App\Http\Controllers\SendSuperbaseEmailController;
use Illuminate\Support\Facades\Route;


/* Send email */
Route::post('/send_email_passeword_reset',[SendSuperbaseEmailController::class, 'send_email_passeword_reset']);
Route::post('/send_email',[SendSuperbaseEmailController::class, 'index']);
Route::post('/send_activites_recu_email',[SendSuperbaseEmailController::class, 'send_activites_recu_email']);
