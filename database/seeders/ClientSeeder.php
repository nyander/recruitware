<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $faker = Faker::create('en_GB');

        for ($i = 0; $i < 20; $i++) {
            Client::create([
                'name' => $faker->company,
                'contact_person' => $faker->name,
                'email' => $faker->companyEmail,
                'phone' => $faker->phoneNumber,
            ]);
        }
    }
}
