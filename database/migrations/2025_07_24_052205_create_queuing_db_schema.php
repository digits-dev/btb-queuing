<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Counters
        Schema::create('queue_counters', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('branch_id');
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Assign users to counters
        Schema::create('queue_counter_user_assignments', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('counter_id');
            $table->bigInteger('user_id');
            $table->timestamp('assigned_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('unassigned_at')->nullable();
        });

        // Lane Types (priority / regular)
        Schema::create('queue_lane_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 30);
            $table->timestamps();
        });

        // Service Types (under regular lane)
        Schema::create('queue_service_types', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('lane_type_id');
            $table->string('name', 30);
            $table->timestamps();
        });

        // Queue Numbers
        Schema::create('queue_numbers', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('branch_id');
            $table->bigInteger('counter_id')->nullable();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('lane_type_id');
            $table->bigInteger('service_type_id')->nullable();
            $table->string('queue_number');
            $table->date('queue_date');
            $table->string('status', 30)->default('waiting');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('called_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unique(['queue_number', 'queue_date']);
        });

        Schema::create('queue_model_list', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('queue_issue_desc', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_numbers');
        Schema::dropIfExists('queue_service_types');
        Schema::dropIfExists('queue_lane_types');
        Schema::dropIfExists('queue_counter_user_assignments');
        Schema::dropIfExists('queue_counters');
        Schema::dropIfExists('queue_model_list');
        Schema::dropIfExists('queue_issue_desc');
    }
};
