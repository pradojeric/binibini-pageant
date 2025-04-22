<?php
namespace Database\Seeders;

use App\Models\Candidate;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class CandidateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = Faker::create();

        // Adjust this number to however many candidates you need
        $totalCandidates = 17;

        for ($i = 1; $i <= $totalCandidates; $i++) {
            Candidate::create([
                'pageant_id'       => 1,
                'candidate_number' => $i,
                'picture'          => 'candidate/sample.jpg',
                'last_name'        => $faker->lastName,
                'first_name'       => $faker->firstNameFemale,
                'middle_name'      => $faker->optional()->firstNameFemale,
                'name_ext'         => $faker->optional()->suffix,
                'gender'           => 'ms',
                'nickname'         => $faker->firstNameFemale,
                'description'      => $faker->sentence,
            ]);
        }
    }
}
