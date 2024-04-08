<?php

use App\Http\Controllers\AdminScoringController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\CriteriaController;
use App\Http\Controllers\JudgeController;
use App\Http\Controllers\PageantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScoreController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

Route::get('/', function () {
    return redirect()->route('login');
    // return Inertia::render('Welcome', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/scoring/pageants', [ScoreController::class, 'index'])->name('scoring.index');
    Route::get('/scoring/{pageant}/details', [ScoreController::class, 'showDetails'])->name('scoring.details');
    Route::get('/scoring/{pageant}/criterias/{criteria}', [ScoreController::class, 'score'])->name('scoring.score');
    Route::get('/scoring/pageants/{pageant}', [ScoreController::class, 'show'])->name('scoring.show');
    Route::post('/scoring/pageants/{pageant}/store', [ScoreController::class, 'store'])->name('scoring.store');

    Route::middleware('check.role:admin')->group(function () {
        Route::resource('judges', JudgeController::class)->parameters([
            'judges' => 'user',
        ]);
        Route::resource('pageants', PageantController::class)->except(['update']);
        Route::post('/pageants/{pageant}/update', [PageantController::class, 'update'])->name('pageants.update');

        Route::get('/pageants/{pageant}/end-pageant', [PageantController::class, 'endPageant'])->name('end.pageant');
        Route::get('/pageants/{pageant}/select-judges', [PageantController::class, 'selectJudges'])->name('pageant.select-judges');
        Route::post('/pageants/{pageant}/store-judges', [PageantController::class, 'storeJudges'])->name('pageant.store-judges');
        Route::put('/pageants/{pageant}/change-round', [PageantController::class, 'changeRound'])->name('pageant.change-round');
        Route::put('/pageants/{pageant}/change-group', [PageantController::class, 'changeGroup'])->name('pageant.change-group');

        Route::resource('pageants.criterias', CriteriaController::class)->shallow();
        Route::resource('pageants.candidates', CandidateController::class)->except(['update'])->shallow();
        Route::post('/candidates/{candidate}/update', [CandidateController::class, 'update'])->name('candidates.update');

        Route::get('/scoring/{pageant}/admin', [AdminScoringController::class, 'show'])->name('scoring.admin');
        Route::post('/scoring/{pageant}/admin/store', [AdminScoringController::class, 'store'])->name('scoring.admin.store');

        Route::get('/pageant/{pageant}/candidate-round', [AdminScoringController::class, 'select'])->name('pageant.candidates.select');
        Route::post('/pageant/{pageant}/candidate-round/store', [AdminScoringController::class, 'selectStore'])->name('select.store');

        Route::get('/pageant/{pageant}/deduct', [AdminScoringController::class, 'deduct'])->name('pageant.deduct');
        Route::post('/pageant/{pageant}/deduct/store', [AdminScoringController::class, 'storeDeduction'])->name('pageant.deduct.store');

        Route::get('/pageants/view-scores/{pageant}', [ScoreController::class, 'viewScores'])->name('pageant.view-scores');
        Route::get('/pageants/{pageant}/for-printing', [ScoreController::class, 'forPrinting'])->name('pageant.for-printing');
    });

});

require __DIR__ . '/auth.php';
