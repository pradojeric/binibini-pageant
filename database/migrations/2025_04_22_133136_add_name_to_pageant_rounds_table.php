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
        Schema::table('pageant_rounds', function (Blueprint $table) {
            $table->string('round_name')->after('round');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pageant_rounds', function (Blueprint $table) {
            $table->dropColumn('round_name');
        });
    }
};
