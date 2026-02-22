-- Migration to add slug and SEO metadata fields to the news table

ALTER TABLE news
    ADD COLUMN slug VARCHAR(255),
    ADD COLUMN seo_title VARCHAR(255),
    ADD COLUMN seo_description TEXT;

-- Ensure slug is unique
ALTER TABLE news
    ADD CONSTRAINT unique_slug UNIQUE (slug);