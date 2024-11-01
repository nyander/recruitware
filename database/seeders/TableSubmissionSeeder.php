<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TableSubmission;
use Faker\Factory as Faker;

class TableSubmissionSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('en_GB');

        $jobTypes = ['Nurse', 'Doctor', 'Physiotherapist', 'Radiographer', 'Pharmacist'];
        $shiftPatterns = ['Day', 'Night', 'Rotating'];
        $branches = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'];
        $classifications = ['Band 5', 'Band 6', 'Band 7', 'Consultant'];

        for ($i = 0; $i < 50; $i++) {
            $firstName = $faker->firstName;
            $lastName = $faker->lastName;

            TableSubmission::create([
                'candidate_ref' => 'NHS-' . $faker->unique()->randomNumber(5),
                'full_name' => $firstName . ' ' . $lastName,
                'email' => $faker->unique()->safeEmail,
                'shift_pattern' => $faker->randomElement($shiftPatterns),
                'location' => $faker->city,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'job_type' => $faker->randomElement($jobTypes),
                'phone' => $faker->phoneNumber,
                'assessed' => $faker->boolean(80), // 80% chance of being true
                'date_of_birth' => $faker->dateTimeBetween('-60 years', '-20 years')->format('Y-m-d'),
                'branch' => $faker->randomElement($branches),
                'avail_window' => $faker->dateTimeBetween('now', '+3 months')->format('Y-m-d'),
                'classification' => $faker->randomElement($classifications),
                'county' => $faker->county,
            ]);
        }
    }
}