#
I am creating a dashboard for inventory inspection. This is refactor from previous project at `../rina-inventa-2`. Use it as reference especially the theme.

## Admin Page
The `/admin` page:
- needs login
- has a sidebar menu

Create database with the following table for source (master) for:
- `land` from `resources/0710 AT-A 2025.xlsx`
- `tool-machine` from `resources/0710 AT-B 2025.xlsx`
- `tool-sofware` from `resources/0710 ATB 2025.xlsx`
- `building` from `resources/0710 AT-C 2025.xlsx`
- `road` from `resources/0710 AT-D 2025.xlsx`
- `permanent-asset` from `resources/0710 AT-E 2025.xlsx`
- `construction` from `resources/0710 AT-F 2025.xlsx`
- `other-asset` from `resources/0710 ASET LAIN-LAIN 2025.xlsx`
- `extra-asset` from `resources/0710 ASET EKSTRAKOMPT 2025.xlsx`
- `room` with the following columns:
  - `id`
  - `building_code`, with FK to `building`.`code`
  - `name` varchar(100)
  - `space` varchar(20)
- `unit` with the following columns:
  - `id`
  - `code` varchar(50), unique
  - `name` varchar(100)

For each table above:
- has `id` column as primary key, `unsigned int`, auto increment
- name any column with `camelCase`
- convert each columns to english. inform the list first in case needs some correction
  - for `kib`, rename it to `code`
- has CRUD page under `/admin`, with each table name as its path, e.g. `/admin/land`.
  - The content structure will be
    [title].....[add-button] [upload-button]
    [column-filters]
    [table]
    [pagination] 
  - the entry form will be shown as modal dialog.
  - the upload button pops-up uplod dialog. it scan the datta from `.xlsx` and create or update the data.
  - filtering query params uses `kebab-case`
  - `room` will have additional column named `QRCode` with an icon for the value.
    it will pops-up modal on click to show the QR code that contains url to `{domain}/inspections?room-id={room_id}`
  
Create inspection (transaction) table for:
- `inspection` with the following columns:
  - `id`
  - `date` datetime
- `tool-machine-inspection` from `resources/0710 AT-A 2025.xlsx`, with additonal columns:
  - `room_id` column that refers to `room.id`
  - `img_url` varchar(255)

For each table above, apply the same features as previously described, with several notes:
- for `tool-machine-inspection`
  - uploading data scan first sheet only
  - it will also create or update `room` data with the following information:
    - `name` from value of `Ruang` field
    - `space` from value of `Luast` field
    - since `room` doesn't have `code`, it will use `building_id` and `name` as unique identifier
  - column `Image`, with icon button, will pop-up modal dialog:
    - shows the image
    - has upload button to upload the image
    - uploading replace the image
    - uploaded image is stored a directory that can be accessed through
      `{domain}/img/inspection/tool-machine-inspection/{date}/{tool-machine-inspection.id}.jpg`

Order the side menu as follows:
- Utama (group label)
- Inspeksi (`tool-machine-inspection`)
- -- separator
- Source (group label)
- Peralatan dan Mesin (`tool-machine`)
- Peralatan Lain (`tool-sofware`)
- Gedung dan Bangunan (`building`)
- Aset Tetap Lainnya (`permanent-asset`)
- Jalan, Irigasi dan Jaringan (`road`)
- Aset Ekstrakompt (`extra-asset`)
- Aset Lain-Lain (`other-asset`)
- Tanah (`land`)
- -- separator
- Pengguna (`user`)

## The Dashboard, anythinge except `/admin/*`

There will be the following routes:
- `/` for the landing page. Very similar to the previous project. Except, the chart section is for `room` instead of `unit`.

- `/inspections` to list `tool-machine-inspection`. Very similar to the previous project with the except the `unit` filter is replaced by `room` filter.

## API

Use `/api` for the api root.

## Technical things

The stacks:
- sveltekit
- shadcn-svelte
- mysql.

Directory structure use default sveltekit structure with additional convention:
- `src/lib` is for any common (or public) component (or script) that is not related to business logic directly.
- `src/app` is for the main app component that is related to business logic directly.
  - `src/app/content` is for the content of a page.
  - `src/app/components` is for the components that are used in the content.
- `src/routes/api/*` for the api end point if needed backend side.
