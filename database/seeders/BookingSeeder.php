<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Client;
use App\Models\TableSubmission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $faker = Faker::create('en_GB');

        $clients = Client::all();
        $candidates = TableSubmission::all();

        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        for ($i = 0; $i < 100; $i++) {
            $startDate = $faker->dateTimeBetween('-1 month', '+2 months');
            $endDate = $faker->dateTimeBetween($startDate, $startDate->format('Y-m-d').' +2 weeks');

            Booking::create([
                'client_id' => $clients->random()->id,
                'candidate_id' => $candidates->random()->id,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'status' => $faker->randomElement($statuses),
            ]);
        }
    }
}
