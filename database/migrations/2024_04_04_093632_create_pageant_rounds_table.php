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
        Schema::create('pageant_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pageant_id')->constrained();
            $table->string('pageant_type');
            $table->integer('round');
            $table->integer('number_of_candidates');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pageant_rounds');
    }
};
