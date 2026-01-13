CREATE TABLE IF NOT EXISTS "knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"role" text,
	"seniority" text,
	"category" text,
	"content" text NOT NULL,
	"embedding" vector(768),
	"source" text,
	"confidence" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "optimizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"resume_id" integer NOT NULL,
	"job_description" text NOT NULL,
	"optimized_content" text NOT NULL,
	"keywords" jsonb,
	"model_used" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resume_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"resume_id" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024),
	"chunk_index" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text DEFAULT 'anonymous' NOT NULL,
	"original_text" text NOT NULL,
	"file_name" text,
	"file_size" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_cvs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text DEFAULT 'Untitled CV' NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "optimizations" ADD CONSTRAINT "optimizations_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resume_chunks" ADD CONSTRAINT "resume_chunks_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
