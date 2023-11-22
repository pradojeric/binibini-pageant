<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pageant_award', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pageant_id')->constrained();
            $table->foreignId('candidate_id')->constrained();
            $table->string('award')->nullable();
            $table->integer('ranking');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pageant_award');
    }
};
