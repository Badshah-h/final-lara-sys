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
        Schema::table('response_formats', function (Blueprint $table) {
            // Drop the content column as we'll replace it with a better structure
            $table->dropColumn('content');
            
            // Add new columns for better prompt handling
            $table->text('template')->after('description');
            $table->text('example_output')->nullable()->after('template');
            $table->json('variables')->nullable()->after('parameters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('response_formats', function (Blueprint $table) {
            // Remove the new columns
            $table->dropColumn(['template', 'example_output', 'variables']);
            
            // Add back the original content column
            $table->text('content')->after('description');
        });
    }
}; 