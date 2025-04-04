<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Candidate;
use Faker\Factory as Faker;

class CandidateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $faker = Faker::create();

        $locations = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'];
        $shiftPatterns = ['Day', 'Night', 'Rotating'];
        $classifications = ['Nurse', 'Doctor', 'Technician', 'Administrator'];
        $statuses = Candidate::STATUSES;

        for ($i = 0; $i < 50; $i++) {
            Candidate::create([
                'location' => $faker->randomElement($locations),
                'last_name' => $faker->lastName,
                'first_name' => $faker->firstName,
                'age' => $faker->numberBetween(22, 65),
                'avail_window' => $faker->dateTimeBetween('now', '+3 months'),
                'shift_pattern' => $faker->randomElement($shiftPatterns),
                'classification' => $faker->randomElement($classifications),
                'email' => $faker->unique()->safeEmail,
                'phone' => $faker->phoneNumber,
                'ref' => $faker->unique()->bothify('CAN-####-????'),
                'assessed_pack' => $faker->boolean(70),
                'status' => $faker->randomElement($statuses),
            ]);
        }
    }
}
