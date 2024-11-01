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
        Schema::create('table_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('candidate_ref')->nullable();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('shift_pattern')->nullable();
            $table->string('location')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('job_type')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('assessed')->default(false);
            $table->date('date_of_birth')->nullable();
            $table->string('branch')->nullable();
            $table->string('avail_window')->nullable();
            $table->string('classification')->nullable();
            $table->string('county')->nullable();
            $table->string('availability_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_submissions');
    }
};