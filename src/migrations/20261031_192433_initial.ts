import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'hi');
  CREATE TYPE "public"."enum_leads_status_history_from" AS ENUM('new', 'contacted', 'qualified', 'site-visit', 'quotation-sent', 'negotiation', 'won', 'lost');
  CREATE TYPE "public"."enum_leads_status_history_to" AS ENUM('new', 'contacted', 'qualified', 'site-visit', 'quotation-sent', 'negotiation', 'won', 'lost');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'site-visit', 'quotation-sent', 'negotiation', 'won', 'lost');
  CREATE TYPE "public"."enum_leads_lost_reason" AS ENUM('price', 'timeline', 'competitor', 'not-genuine', 'no-response', 'other');
  CREATE TYPE "public"."enum_leads_score_band" AS ENUM('hot', 'warm', 'cold');
  CREATE TYPE "public"."enum_leads_service" AS ENUM('house-construction', 'interior', 'renovation', 'fabrication', 'turnkey', 'commercial', 'not-sure');
  CREATE TYPE "public"."enum_leads_plot_status" AS ENUM('ready', 'under-purchase', 'existing-building');
  CREATE TYPE "public"."enum_leads_budget_band" AS ENUM('under-10', '10-25', '25-50', '50-100', '100-plus');
  CREATE TYPE "public"."enum_leads_timeline" AS ENUM('immediately', '1-3-months', '3-6-months', 'exploring');
  CREATE TYPE "public"."enum_leads_preferred_visit_slot" AS ENUM('morning', 'afternoon', 'evening');
  CREATE TYPE "public"."enum_leads_source" AS ENUM('site-visit', 'calculator', 'contact', 'service-page', 'home', 'manual');
  CREATE TYPE "public"."enum_leads_attribution_device" AS ENUM('mobile', 'tablet', 'desktop');
  CREATE TYPE "public"."enum_leads_attribution_channel" AS ENUM('google-ads', 'meta-ads', 'organic', 'gbp', 'direct', 'whatsapp', 'other');
  CREATE TYPE "public"."enum_services_tiers_tier" AS ENUM('basic', 'standard', 'premium');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('general', 'service');
  CREATE TYPE "public"."enum_pages_slug" AS ENUM('commercial', 'privacy-policy', 'terms');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  CREATE TYPE "public"."enum_rates_rates_service" AS ENUM('house-construction', 'renovation', 'interior', 'turnkey', 'fabrication');
  CREATE TYPE "public"."enum_rates_rates_tier" AS ENUM('basic', 'standard', 'premium');
  CREATE TYPE "public"."enum_rates_extras_key" AS ENUM('parking', 'boundaryWall', 'basement');
  CREATE TYPE "public"."enum_rates_extras_pricing" AS ENUM('fixed', 'perSqft');
  CREATE TYPE "public"."enum_rates_breakdown_service" AS ENUM('house-construction', 'renovation', 'interior', 'turnkey', 'fabrication');
  CREATE TYPE "public"."enum_rates_fabrication_display" AS ENUM('quote', 'per-kg');
  CREATE TABLE "leads_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"at" timestamp(3) with time zone,
  	"author_id" integer
  );
  
  CREATE TABLE "leads_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" "enum_leads_status_history_from",
  	"to" "enum_leads_status_history_to",
  	"at" timestamp(3) with time zone,
  	"by_id" integer
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"lost_reason" "enum_leads_lost_reason",
  	"next_follow_up" timestamp(3) with time zone,
  	"assigned_to_id" integer,
  	"score" numeric,
  	"score_band" "enum_leads_score_band",
  	"score_override" numeric,
  	"quotation_amount" numeric,
  	"won_amount" numeric,
  	"won_date" timestamp(3) with time zone,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"locality" varchar,
  	"service" "enum_leads_service",
  	"area_size" varchar,
  	"floors" varchar,
  	"plot_status" "enum_leads_plot_status",
  	"budget_band" "enum_leads_budget_band",
  	"timeline" "enum_leads_timeline",
  	"preferred_visit_date" timestamp(3) with time zone,
  	"preferred_visit_slot" "enum_leads_preferred_visit_slot",
  	"message" varchar,
  	"calculator" jsonb,
  	"source" "enum_leads_source",
  	"source_detail" varchar,
  	"attribution_utm_source" varchar,
  	"attribution_utm_medium" varchar,
  	"attribution_utm_campaign" varchar,
  	"attribution_utm_term" varchar,
  	"attribution_utm_content" varchar,
  	"attribution_gclid" varchar,
  	"attribution_fbclid" varchar,
  	"attribution_landing_page" varchar,
  	"attribution_referrer" varchar,
  	"attribution_first_visit_at" timestamp(3) with time zone,
  	"attribution_device" "enum_leads_attribution_device",
  	"attribution_channel" "enum_leads_attribution_channel",
  	"consent_given" boolean DEFAULT false,
  	"consent_at" timestamp(3) with time zone,
  	"consent_text_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_pain_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "services_tiers_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "services_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tier" "enum_services_tiers_tier" NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"card_image_id" integer,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar,
  	"hero_headline" varchar,
  	"hero_sub" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_before_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_after_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"service_id" integer NOT NULL,
  	"area" varchar NOT NULL,
  	"plot_size" varchar,
  	"built_up_area" varchar,
  	"duration" varchar,
  	"budget_range" varchar,
  	"show_budget_publicly" boolean DEFAULT false,
  	"video_id" integer,
  	"video_url" varchar,
  	"testimonial_id" integer,
  	"featured" boolean DEFAULT false,
  	"status" "enum_projects_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar NOT NULL,
  	"challenge" varchar,
  	"solution" varchar,
  	"result" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_name" varchar NOT NULL,
  	"area" varchar,
  	"project_id" integer,
  	"service_id" integer,
  	"video_id" integer,
  	"rating" numeric,
  	"consent_to_publish" boolean DEFAULT false NOT NULL,
  	"status" "enum_testimonials_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"cover_id" integer,
  	"author" varchar DEFAULT 'Rahul Tripathi',
  	"published_at" timestamp(3) with time zone,
  	"related_service_id" integer,
  	"status" "enum_guides_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "guides_locales" (
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"outline" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_faqs_category" DEFAULT 'general' NOT NULL,
  	"service_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" "enum_pages_slug" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar,
  	"body" jsonb,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'staff' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"leads_id" integer,
  	"services_id" integer,
  	"projects_id" integer,
  	"testimonials_id" integer,
  	"guides_id" integer,
  	"faqs_id" integer,
  	"pages_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar DEFAULT 'PLACEHOLDER',
  	"whatsapp" varchar DEFAULT 'PLACEHOLDER',
  	"email" varchar DEFAULT 'info@shrimconstruction.in',
  	"address_full" varchar DEFAULT '86F/4, Khasra No 195-196, Mallhaur Road, Near Amity University, Chinhat (Nizampur Mallhaur), Lucknow, Uttar Pradesh – 226028',
  	"address_short" varchar DEFAULT 'Chinhat, Lucknow',
  	"show_full_address" boolean DEFAULT false,
  	"gstin" varchar DEFAULT '09BAYPT7371Q2Z3',
  	"social_instagram" varchar,
  	"social_facebook" varchar,
  	"social_youtube" varchar,
  	"social_google_business" varchar,
  	"hero_video_id" integer,
  	"hero_poster_id" integer,
  	"hero_image_id" integer,
  	"seo_opening_hours_spec" varchar DEFAULT 'Mo-Sa 09:30-18:30',
  	"seo_geo_lat" numeric,
  	"seo_geo_lng" numeric,
  	"stats_years_experience" varchar DEFAULT '7+',
  	"stats_project_count" varchar DEFAULT '[PROJECT COUNT]',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"office_hours" varchar DEFAULT 'Mon–Sat, 9:30 AM – 6:30 PM',
  	"thank_you_promise" varchar DEFAULT 'Hum 30 minute ke andar call karenge',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rates_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service" "enum_rates_rates_service" NOT NULL,
  	"tier" "enum_rates_rates_tier" NOT NULL,
  	"rate" numeric NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "rates_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_rates_extras_key" NOT NULL,
  	"pricing" "enum_rates_extras_pricing" DEFAULT 'fixed' NOT NULL,
  	"value" numeric NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "rates_extras_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "rates_breakdown" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service" "enum_rates_breakdown_service" NOT NULL,
  	"percent" numeric NOT NULL
  );
  
  CREATE TABLE "rates_breakdown_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "rates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sample_data" boolean DEFAULT true,
  	"fabrication_display" "enum_rates_fabrication_display" DEFAULT 'quote',
  	"fabrication_per_kg_rate" numeric,
  	"range_percent" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "tracking" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"gtm_id" varchar,
  	"meta_pixel_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_team_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page_team_photos_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"founder_name" varchar DEFAULT 'Rahul Tripathi',
  	"founder_photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"headline" varchar,
  	"story" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "leads_notes" ADD CONSTRAINT "leads_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_notes" ADD CONSTRAINT "leads_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_status_history" ADD CONSTRAINT "leads_status_history_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_status_history" ADD CONSTRAINT "leads_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_pain_points" ADD CONSTRAINT "services_pain_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_inclusions" ADD CONSTRAINT "services_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_tiers_highlights" ADD CONSTRAINT "services_tiers_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_tiers" ADD CONSTRAINT "services_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_before_images" ADD CONSTRAINT "projects_before_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_before_images" ADD CONSTRAINT "projects_before_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_after_images" ADD CONSTRAINT "projects_after_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_after_images" ADD CONSTRAINT "projects_after_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_related_service_id_services_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_locales" ADD CONSTRAINT "guides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_poster_id_media_id_fk" FOREIGN KEY ("hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates_rates" ADD CONSTRAINT "rates_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates_extras" ADD CONSTRAINT "rates_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates_extras_locales" ADD CONSTRAINT "rates_extras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rates_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates_breakdown" ADD CONSTRAINT "rates_breakdown_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates_breakdown_locales" ADD CONSTRAINT "rates_breakdown_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rates_breakdown"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_team_photos" ADD CONSTRAINT "about_page_team_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_team_photos" ADD CONSTRAINT "about_page_team_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_team_photos_locales" ADD CONSTRAINT "about_page_team_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_team_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values" ADD CONSTRAINT "about_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_founder_photo_id_media_id_fk" FOREIGN KEY ("founder_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_notes_order_idx" ON "leads_notes" USING btree ("_order");
  CREATE INDEX "leads_notes_parent_id_idx" ON "leads_notes" USING btree ("_parent_id");
  CREATE INDEX "leads_notes_author_idx" ON "leads_notes" USING btree ("author_id");
  CREATE INDEX "leads_status_history_order_idx" ON "leads_status_history" USING btree ("_order");
  CREATE INDEX "leads_status_history_parent_id_idx" ON "leads_status_history" USING btree ("_parent_id");
  CREATE INDEX "leads_status_history_by_idx" ON "leads_status_history" USING btree ("by_id");
  CREATE UNIQUE INDEX "leads_reference_idx" ON "leads" USING btree ("reference");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_next_follow_up_idx" ON "leads" USING btree ("next_follow_up");
  CREATE INDEX "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to_id");
  CREATE INDEX "leads_score_band_idx" ON "leads" USING btree ("score_band");
  CREATE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");
  CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
  CREATE INDEX "leads_attribution_attribution_channel_idx" ON "leads" USING btree ("attribution_channel");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "services_pain_points_order_idx" ON "services_pain_points" USING btree ("_order");
  CREATE INDEX "services_pain_points_parent_id_idx" ON "services_pain_points" USING btree ("_parent_id");
  CREATE INDEX "services_pain_points_locale_idx" ON "services_pain_points" USING btree ("_locale");
  CREATE INDEX "services_inclusions_order_idx" ON "services_inclusions" USING btree ("_order");
  CREATE INDEX "services_inclusions_parent_id_idx" ON "services_inclusions" USING btree ("_parent_id");
  CREATE INDEX "services_inclusions_locale_idx" ON "services_inclusions" USING btree ("_locale");
  CREATE INDEX "services_tiers_highlights_order_idx" ON "services_tiers_highlights" USING btree ("_order");
  CREATE INDEX "services_tiers_highlights_parent_id_idx" ON "services_tiers_highlights" USING btree ("_parent_id");
  CREATE INDEX "services_tiers_highlights_locale_idx" ON "services_tiers_highlights" USING btree ("_locale");
  CREATE INDEX "services_tiers_order_idx" ON "services_tiers" USING btree ("_order");
  CREATE INDEX "services_tiers_parent_id_idx" ON "services_tiers" USING btree ("_parent_id");
  CREATE INDEX "services_tiers_locale_idx" ON "services_tiers" USING btree ("_locale");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_card_image_idx" ON "services" USING btree ("card_image_id");
  CREATE INDEX "services_hero_image_idx" ON "services" USING btree ("hero_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_before_images_order_idx" ON "projects_before_images" USING btree ("_order");
  CREATE INDEX "projects_before_images_parent_id_idx" ON "projects_before_images" USING btree ("_parent_id");
  CREATE INDEX "projects_before_images_image_idx" ON "projects_before_images" USING btree ("image_id");
  CREATE INDEX "projects_after_images_order_idx" ON "projects_after_images" USING btree ("_order");
  CREATE INDEX "projects_after_images_parent_id_idx" ON "projects_after_images" USING btree ("_parent_id");
  CREATE INDEX "projects_after_images_image_idx" ON "projects_after_images" USING btree ("image_id");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_service_idx" ON "projects" USING btree ("service_id");
  CREATE INDEX "projects_video_idx" ON "projects" USING btree ("video_id");
  CREATE INDEX "projects_testimonial_idx" ON "projects" USING btree ("testimonial_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "testimonials_project_idx" ON "testimonials" USING btree ("project_id");
  CREATE INDEX "testimonials_service_idx" ON "testimonials" USING btree ("service_id");
  CREATE INDEX "testimonials_video_idx" ON "testimonials" USING btree ("video_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_locales_parent_id_idx" ON "testimonials_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "guides" USING btree ("slug");
  CREATE INDEX "guides_cover_idx" ON "guides" USING btree ("cover_id");
  CREATE INDEX "guides_related_service_idx" ON "guides" USING btree ("related_service_id");
  CREATE INDEX "guides_updated_at_idx" ON "guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "guides" USING btree ("created_at");
  CREATE UNIQUE INDEX "guides_locales_locale_parent_id_unique" ON "guides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides_locales_parent_id_idx" ON "guides_locales" USING btree ("_parent_id");
  CREATE INDEX "faqs_service_idx" ON "faqs" USING btree ("service_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_locales_parent_id_idx" ON "faqs_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_hero_hero_video_idx" ON "site_settings" USING btree ("hero_video_id");
  CREATE INDEX "site_settings_hero_hero_poster_idx" ON "site_settings" USING btree ("hero_poster_id");
  CREATE INDEX "site_settings_hero_hero_image_idx" ON "site_settings" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "rates_rates_order_idx" ON "rates_rates" USING btree ("_order");
  CREATE INDEX "rates_rates_parent_id_idx" ON "rates_rates" USING btree ("_parent_id");
  CREATE INDEX "rates_extras_order_idx" ON "rates_extras" USING btree ("_order");
  CREATE INDEX "rates_extras_parent_id_idx" ON "rates_extras" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rates_extras_locales_locale_parent_id_unique" ON "rates_extras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rates_extras_locales_parent_id_idx" ON "rates_extras_locales" USING btree ("_parent_id");
  CREATE INDEX "rates_breakdown_order_idx" ON "rates_breakdown" USING btree ("_order");
  CREATE INDEX "rates_breakdown_parent_id_idx" ON "rates_breakdown" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rates_breakdown_locales_locale_parent_id_unique" ON "rates_breakdown_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rates_breakdown_locales_parent_id_idx" ON "rates_breakdown_locales" USING btree ("_parent_id");
  CREATE INDEX "about_page_team_photos_order_idx" ON "about_page_team_photos" USING btree ("_order");
  CREATE INDEX "about_page_team_photos_parent_id_idx" ON "about_page_team_photos" USING btree ("_parent_id");
  CREATE INDEX "about_page_team_photos_image_idx" ON "about_page_team_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "about_page_team_photos_locales_locale_parent_id_unique" ON "about_page_team_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_team_photos_locales_parent_id_idx" ON "about_page_team_photos_locales" USING btree ("_parent_id");
  CREATE INDEX "about_page_values_order_idx" ON "about_page_values" USING btree ("_order");
  CREATE INDEX "about_page_values_parent_id_idx" ON "about_page_values" USING btree ("_parent_id");
  CREATE INDEX "about_page_values_locale_idx" ON "about_page_values" USING btree ("_locale");
  CREATE INDEX "about_page_founder_photo_idx" ON "about_page" USING btree ("founder_photo_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_locales_parent_id_idx" ON "about_page_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "leads_notes" CASCADE;
  DROP TABLE "leads_status_history" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "services_pain_points" CASCADE;
  DROP TABLE "services_inclusions" CASCADE;
  DROP TABLE "services_tiers_highlights" CASCADE;
  DROP TABLE "services_tiers" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "projects_before_images" CASCADE;
  DROP TABLE "projects_after_images" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "guides" CASCADE;
  DROP TABLE "guides_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "rates_rates" CASCADE;
  DROP TABLE "rates_extras" CASCADE;
  DROP TABLE "rates_extras_locales" CASCADE;
  DROP TABLE "rates_breakdown" CASCADE;
  DROP TABLE "rates_breakdown_locales" CASCADE;
  DROP TABLE "rates" CASCADE;
  DROP TABLE "tracking" CASCADE;
  DROP TABLE "about_page_team_photos" CASCADE;
  DROP TABLE "about_page_team_photos_locales" CASCADE;
  DROP TABLE "about_page_values" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_leads_status_history_from";
  DROP TYPE "public"."enum_leads_status_history_to";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_lost_reason";
  DROP TYPE "public"."enum_leads_score_band";
  DROP TYPE "public"."enum_leads_service";
  DROP TYPE "public"."enum_leads_plot_status";
  DROP TYPE "public"."enum_leads_budget_band";
  DROP TYPE "public"."enum_leads_timeline";
  DROP TYPE "public"."enum_leads_preferred_visit_slot";
  DROP TYPE "public"."enum_leads_source";
  DROP TYPE "public"."enum_leads_attribution_device";
  DROP TYPE "public"."enum_leads_attribution_channel";
  DROP TYPE "public"."enum_services_tiers_tier";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_pages_slug";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_rates_rates_service";
  DROP TYPE "public"."enum_rates_rates_tier";
  DROP TYPE "public"."enum_rates_extras_key";
  DROP TYPE "public"."enum_rates_extras_pricing";
  DROP TYPE "public"."enum_rates_breakdown_service";
  DROP TYPE "public"."enum_rates_fabrication_display";`)
}
