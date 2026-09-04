--
-- PostgreSQL database dump
--

\restrict aTTEilXi6NMfQNgtJT5k9aXsxwioSBOFqTJPMc9oc7Eg8TrKU7ZA26uV3dKHOkV

-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: projectstatus; Type: TYPE; Schema: public; Owner: dorsa
--

CREATE TYPE public.projectstatus AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public.projectstatus OWNER TO dorsa;

--
-- Name: projecttype; Type: TYPE; Schema: public; Owner: dorsa
--

CREATE TYPE public.projecttype AS ENUM (
    'RESIDENTIAL',
    'COMMERCIAL',
    'OFFICE',
    'VILLA',
    'CULTURAL',
    'EDUCATIONAL',
    'OTHER'
);


ALTER TYPE public.projecttype OWNER TO dorsa;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: dorsa
--

CREATE TABLE public.admins (
    id uuid NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255),
    is_active boolean NOT NULL,
    is_superuser boolean NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admins OWNER TO dorsa;

--
-- Name: COLUMN admins.username; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.username IS 'Unique username for login';


--
-- Name: COLUMN admins.email; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.email IS 'Admin email address';


--
-- Name: COLUMN admins.hashed_password; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.hashed_password IS 'Bcrypt hashed password';


--
-- Name: COLUMN admins.full_name; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.full_name IS 'Admin''s full name';


--
-- Name: COLUMN admins.is_active; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.is_active IS 'Account active status';


--
-- Name: COLUMN admins.is_superuser; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.is_superuser IS 'Superuser with full access';


--
-- Name: COLUMN admins.last_login; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.last_login IS 'Last login timestamp';


--
-- Name: COLUMN admins.created_at; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.created_at IS 'Account creation timestamp';


--
-- Name: COLUMN admins.updated_at; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.admins.updated_at IS 'Last update timestamp';


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: dorsa
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO dorsa;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: dorsa
--

CREATE TABLE public.projects (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    full_description text,
    project_type public.projecttype,
    client_name character varying(255),
    year character varying(20),
    area character varying(50),
    status public.projectstatus NOT NULL,
    cover_image character varying(500),
    gallery_images character varying(500),
    is_featured boolean NOT NULL,
    views integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    features text
);


ALTER TABLE public.projects OWNER TO dorsa;

--
-- Name: COLUMN projects.title; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.projects.title IS 'عنوان پروژه';


--
-- Name: COLUMN projects.description; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.projects.description IS 'توضیحات کوتاه';


--
-- Name: COLUMN projects.full_description; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.projects.full_description IS 'توضیحات کامل';


--
-- Name: COLUMN projects.features; Type: COMMENT; Schema: public; Owner: dorsa
--

COMMENT ON COLUMN public.projects.features IS 'ویژگی‌ها (جداسازی با کاما)';


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: dorsa
--

COPY public.admins (id, username, email, hashed_password, full_name, is_active, is_superuser, last_login, created_at, updated_at) FROM stdin;
729a4329-0e8d-47b9-9ee8-3abcaa6e6516	admin	admin@dorsadesign.ir	$2b$12$.5ACKsaXg0SIoZOTauEr.OU7WJxKMlxuswDc3KLUYmzAYdJu1Bmgm	Admin User	t	f	2026-08-15 12:08:53.56895+00	2026-08-15 11:38:37.288319+00	2026-08-15 12:08:53.241332+00
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: dorsa
--

COPY public.alembic_version (version_num) FROM stdin;
ddea6c762cd0
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: dorsa
--

COPY public.projects (id, title, description, full_description, project_type, client_name, year, area, status, cover_image, gallery_images, is_featured, views, created_at, updated_at, features) FROM stdin;
37138489-cf80-406b-8e93-490cccbe8e0c	ویلای ساحلی بندر چارک	ویلای ساحلی بندر چارک	ویلای ساحلی بندر چارک	VILLA		1405	500	PUBLISHED	/uploads/projects/covers/836ac5f3-fd35-4369-9949-85004d6fddc7.jpg	/uploads/projects/galleries/fbff2668-50bd-4e99-b808-4c771c821dc0.jpg,/uploads/projects/galleries/bc3a8101-c782-490e-83ce-c6aeed4b431d.jpg,/uploads/projects/galleries/06ebf86e-6b15-4de7-a2c9-137a6c38fefc.jpg	f	34	2026-08-15 11:54:39.289776+00	2026-08-25 22:56:17.666307+00	\N
\.


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: dorsa
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: dorsa
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: dorsa
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: ix_admins_email; Type: INDEX; Schema: public; Owner: dorsa
--

CREATE UNIQUE INDEX ix_admins_email ON public.admins USING btree (email);


--
-- Name: ix_admins_id; Type: INDEX; Schema: public; Owner: dorsa
--

CREATE INDEX ix_admins_id ON public.admins USING btree (id);


--
-- Name: ix_admins_username; Type: INDEX; Schema: public; Owner: dorsa
--

CREATE UNIQUE INDEX ix_admins_username ON public.admins USING btree (username);


--
-- Name: ix_projects_id; Type: INDEX; Schema: public; Owner: dorsa
--

CREATE INDEX ix_projects_id ON public.projects USING btree (id);


--
-- PostgreSQL database dump complete
--

\unrestrict aTTEilXi6NMfQNgtJT5k9aXsxwioSBOFqTJPMc9oc7Eg8TrKU7ZA26uV3dKHOkV

