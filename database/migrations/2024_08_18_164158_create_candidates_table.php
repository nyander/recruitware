<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('location');
            $table->string('last_name');
            $table->string('first_name');
            $table->integer('age')->nullable();
            $table->date('avail_window')->nullable();
            $table->string('shift_pattern')->nullable();
            $table->string('classification')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('ref')->unique();
            $table->boolean('assessed_pack')->default(false);
            $table->enum('status', ['leaver', 'archived', 'pending', 'audit', 'new', 'live'])->default('new');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('candidates');
    }
};
