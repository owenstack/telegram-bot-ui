CREATE TABLE `telegram_member` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`username` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_active` integer NOT NULL,
	`joined_at` integer NOT NULL,
	`left_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
