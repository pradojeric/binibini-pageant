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
        Schema::create('round_deductions', function (Blueprint $table) {
            $table->foreignId('pageant_round_id')->constrained();
            $table->foreignId('candidate_id')->constrained();
            $table->integer('deduction')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('round_deductions');
    }
};
