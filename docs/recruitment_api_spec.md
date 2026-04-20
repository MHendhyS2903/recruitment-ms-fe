# Recruitment API Draft

Dokumen ini merangkum daftar API yang direkomendasikan untuk aplikasi recruitment saat ini, mengikuti flow:

`Recruiter TO_DO -> Recruiter READY_TO_INTERVIEW -> Sales TO_DO -> Sales INTERVIEWING -> Interview Schedule`

Status dan stage pada API memakai format kode backend:
- `TO_DO`
- `READY_TO_INTERVIEW`
- `INTERVIEWING`
- `INTERVIEW`
- `BACKOUT`
- `RESCHEDULE`
- `PROCESS`
- `FAILED`

Frontend dapat memetakan kode tersebut menjadi label tampilan seperti `TO DO`.

## API Conventions

Base path:

```text
/api
```

Contoh format response sukses:

```json
{
  "data": {},
  "meta": {}
}
```

Contoh format response error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "scheduledAt is required",
    "details": {
      "scheduledAt": ["scheduledAt is required"]
    }
  }
}
```

Contoh format pagination:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

## 1. Auth

### `POST /api/auth/login`
Login user.

Request:

```json
{
  "email": "admin@company.com",
  "password": "secret"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": 1,
      "fullName": "Super Admin",
      "email": "admin@company.com",
      "role": "SUPER_ADMIN"
    },
    "token": "jwt-or-session-token"
  }
}
```

### `POST /api/auth/logout`
Logout user aktif.

### `GET /api/auth/me`
Ambil user yang sedang login.

Response:

```json
{
  "data": {
    "id": 1,
    "fullName": "Super Admin",
    "email": "admin@company.com",
    "role": "SUPER_ADMIN"
  }
}
```

## 2. Candidates

Tabel utama kandidat. Dipakai sebagai sumber profile kandidat yang dipakai recruiter dan sales.

### `GET /api/candidates`
List kandidat.

Query params:
- `search`
- `stage`
- `source`
- `dateOfJoinFrom`
- `dateOfJoinTo`
- `page`
- `limit`

Response:

```json
{
  "data": [
    {
      "id": 101,
      "candidateCode": "CND-2026-0001",
      "fullName": "Alya Rahmania Putri",
      "appliedRole": "Frontend Engineer",
      "email": "alya@mail.com",
      "phone": "08123456789",
      "source": "LinkedIn",
      "location": "Jakarta",
      "expectedSalary": 12000000,
      "expectedSalaryCurrency": "IDR",
      "dateOfJoin": "2026-05-01",
      "summary": "Available in two weeks",
      "photoUrl": "/files/candidates/101/photo.jpg",
      "createdAt": "2026-04-17T09:00:00Z",
      "updatedAt": "2026-04-17T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### `POST /api/candidates`
Tambah kandidat baru.

Request:

```json
{
  "fullName": "Alya Rahmania Putri",
  "appliedRole": "Frontend Engineer",
  "email": "alya@mail.com",
  "phone": "08123456789",
  "source": "LinkedIn",
  "location": "Jakarta",
  "expectedSalary": 12000000,
  "expectedSalaryCurrency": "IDR",
  "dateOfJoin": "2026-05-01",
  "summary": "Available in two weeks"
}
```

Behavior:
- otomatis membuat `recruiterPipeline.stage = TO_DO`
- belum membuat row `salesPipeline`

### `GET /api/candidates/:candidateId`
Detail kandidat.

### `PATCH /api/candidates/:candidateId`
Edit profile kandidat.

Catatan:
- backend dapat menolak edit jika recruiter pipeline sudah locked setelah handoff, sesuai aturan bisnis yang sekarang

### `DELETE /api/candidates/:candidateId`
Hapus kandidat.

### `GET /api/candidates/:candidateId/history`
Ambil riwayat perpindahan stage.

Response:

```json
{
  "data": [
    {
      "id": 9001,
      "module": "RECRUITER",
      "fromStage": "TO_DO",
      "toStage": "READY_TO_INTERVIEW",
      "changedBy": {
        "id": 12,
        "fullName": "Recruiter A"
      },
      "changedAt": "2026-04-17T09:30:00Z",
      "remarks": "Processed by recruiter"
    }
  ]
}
```

## 3. Candidate Documents

### `GET /api/candidates/:candidateId/documents`
List dokumen kandidat.

### `POST /api/candidates/:candidateId/documents`
Upload dokumen kandidat.

Request:
- `multipart/form-data`
- fields:
  - `category`: `CV | PORTOFOLIO | SURAT_LAMARAN | LAMPIRAN`
  - `file`

Response:

```json
{
  "data": {
    "id": 501,
    "candidateId": 101,
    "category": "CV",
    "originalName": "cv-alya.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 234567,
    "url": "/files/candidates/101/cv-alya.pdf",
    "createdAt": "2026-04-17T09:00:00Z"
  }
}
```

### `DELETE /api/candidates/:candidateId/documents/:documentId`
Hapus dokumen kandidat.

### `POST /api/candidates/:candidateId/photo`
Upload atau ganti foto kandidat.

## 4. Recruiter

Endpoint recruiter fokus ke data pipeline recruiter dan tampilan submenu `All Data` dan `To do`.

### `GET /api/recruiter/candidates`
List kandidat untuk menu recruiter.

Query params:
- `view=all|todo`
- `stage`
- `search`
- `page`
- `limit`

Response:

```json
{
  "data": [
    {
      "candidateId": 101,
      "recruiterPipelineId": 201,
      "stage": "TO_DO",
      "createdAt": "2026-04-17T09:00:00Z",
      "candidate": {
        "id": 101,
        "fullName": "Alya Rahmania Putri",
        "appliedRole": "Frontend Engineer",
        "email": "alya@mail.com",
        "phone": "08123456789",
        "source": "LinkedIn",
        "location": "Jakarta",
        "expectedSalary": 12000000,
        "dateOfJoin": "2026-05-01",
        "summary": "Available in two weeks",
        "photoUrl": "/files/candidates/101/photo.jpg"
      },
      "documents": [
        {
          "id": 501,
          "category": "CV",
          "originalName": "cv-alya.pdf"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### `GET /api/recruiter/candidates/:candidateId`
Detail kandidat pada konteks recruiter.

### `PATCH /api/recruiter/candidates/:candidateId`
Edit kandidat pada konteks recruiter.

Catatan:
- hanya boleh untuk kandidat yang belum locked

### `POST /api/recruiter/candidates/:candidateId/process`
Proses kandidat recruiter.

Behavior:
- valid hanya jika stage sekarang `TO_DO`
- recruiter stage berubah jadi `READY_TO_INTERVIEW`
- row sales pipeline dibuat jika belum ada
- sales stage otomatis `TO_DO`
- recruiter record tetap ada untuk monitoring
- candidate stage history ditambah

Request:

```json
{
  "remarks": "Ready to handoff to sales"
}
```

Response:

```json
{
  "data": {
    "candidateId": 101,
    "recruiterPipeline": {
      "id": 201,
      "stage": "READY_TO_INTERVIEW",
      "lockedAfterHandoff": true,
      "handoffToSalesAt": "2026-04-17T10:00:00Z"
    },
    "salesPipeline": {
      "id": 301,
      "stage": "TO_DO"
    }
  }
}
```

### `DELETE /api/recruiter/candidates/:candidateId`
Hapus kandidat dari recruiter.

Catatan:
- biasanya hanya diizinkan jika belum diproses

## 5. Sales

Endpoint sales fokus ke kandidat hasil handoff dari recruiter.

### `GET /api/sales/candidates`
List kandidat untuk menu sales.

Query params:
- `view=all|todo`
- `stage`
- `search`
- `page`
- `limit`

### `GET /api/sales/candidates/:candidateId`
Detail kandidat pada konteks sales.

### `PATCH /api/sales/candidates/:candidateId`
Edit data sales.

Catatan:
- bila ada field profile yang ikut diubah dari sales, backend perlu sinkronkan perubahan ke data kandidat utama

### `POST /api/sales/candidates/:candidateId/process`
Proses kandidat sales dan buat interview schedule.

Request:

```json
{
  "scheduledAt": "2026-04-20T09:00:00Z",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "ownerUserId": 21,
  "hostUserId": 21,
  "notes": "Interview with engineering team"
}
```

Behavior:
- valid hanya jika stage sekarang `TO_DO`
- sales stage berubah jadi `INTERVIEWING`
- recruiter stage ikut berubah jadi `INTERVIEWING`
- row `interviews` otomatis dibuat
- candidate stage history ditambah

Response:

```json
{
  "data": {
    "candidateId": 101,
    "salesPipeline": {
      "id": 301,
      "stage": "INTERVIEWING",
      "scheduledAt": "2026-04-20T09:00:00Z",
      "meetingLink": "https://meet.google.com/abc-defg-hij"
    },
    "recruiterPipeline": {
      "id": 201,
      "stage": "INTERVIEWING"
    },
    "interview": {
      "id": 401,
      "candidateStatus": "INTERVIEW",
      "interviewStatus": "PROCESS"
    }
  }
}
```

### `DELETE /api/sales/candidates/:candidateId`
Hapus data sales.

Catatan:
- jika flow bisnis mengharuskan reset recruiter saat sales record dihapus, endpoint ini bisa sekaligus melakukan rollback stage recruiter

## 6. Interviews

Dipakai oleh halaman `Interview Schedule`.

### `GET /api/interviews`
List interview schedule.

Query params:
- `search`
- `candidateStatus`
- `interviewStatus`
- `ownerUserId`
- `scheduledDate`
- `page`
- `limit`

Response:

```json
{
  "data": [
    {
      "id": 401,
      "candidateId": 101,
      "candidateName": "Alya Rahmania Putri",
      "role": "Frontend Engineer",
      "candidateStatus": "INTERVIEW",
      "scheduledAt": "2026-04-20T09:00:00Z",
      "owner": {
        "id": 21,
        "fullName": "Sales A"
      },
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "host": {
        "id": 21,
        "fullName": "Sales A"
      },
      "interviewStatus": "PROCESS",
      "notes": "Interview with engineering team"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### `GET /api/interviews/:interviewId`
Detail interview.

### `POST /api/interviews`
Buat interview manual.

Catatan:
- opsional untuk versi awal, karena sebagian besar row interview akan dibuat dari proses sales

### `PATCH /api/interviews/:interviewId`
Update hasil/status interview.

Request:

```json
{
  "candidateStatus": "RESCHEDULE",
  "interviewStatus": "PROCESS",
  "scheduledAt": "2026-04-22T13:00:00Z",
  "notes": "Rescheduled by candidate"
}
```

### `DELETE /api/interviews/:interviewId`
Hapus interview.

## 7. Dashboard

Untuk dashboard, backend sebaiknya mengirim hasil agregasi siap pakai agar frontend tidak perlu menghitung manual dari semua modul.

### `GET /api/dashboard`
Ambil semua widget dashboard.

Response:

```json
{
  "data": {
    "summary": {
      "totalData": 120,
      "onProcess": 82,
      "failed": 23,
      "reschedule": 15
    },
    "interviewStatusStats": [
      {
        "key": "PROCESS",
        "label": "On Process",
        "value": 82
      },
      {
        "key": "FAILED",
        "label": "Failed",
        "value": 23
      }
    ],
    "candidateStatusStats": [
      {
        "key": "INTERVIEW",
        "label": "Interview",
        "value": 70
      },
      {
        "key": "BACKOUT",
        "label": "Backout",
        "value": 20
      },
      {
        "key": "RESCHEDULE",
        "label": "Reschedule",
        "value": 15
      }
    ],
    "recruiterStats": [
      {
        "key": "TO_DO",
        "label": "TO DO",
        "value": 12
      },
      {
        "key": "READY_TO_INTERVIEW",
        "label": "Processed",
        "value": 38
      }
    ],
    "salesStats": [
      {
        "key": "TO_DO",
        "label": "TO DO",
        "value": 9
      },
      {
        "key": "INTERVIEWING",
        "label": "Interviewing",
        "value": 21
      }
    ],
    "priorityToday": [
      {
        "candidateId": 101,
        "candidateName": "Alya Rahmania Putri",
        "role": "Frontend Engineer",
        "scheduledAt": "2026-04-20T09:00:00Z",
        "meetingLink": "https://meet.google.com/abc-defg-hij",
        "ownerName": "Sales A"
      }
    ]
  }
}
```

## 8. Master Report

Karena menu `Master Report` sudah ada di frontend, backend bisa menyiapkan endpoint read-only dulu.

### `GET /api/master-report`
List data master report.

Query params:
- `search`
- `source`
- `designation`
- `category`
- `page`
- `limit`

### `GET /api/master-report/export`
Export master report ke CSV atau Excel.

## 9. Optional API

Endpoint ini belum wajib untuk MVP, tetapi relevan jika backend ingin menangani import yang saat ini masih dilakukan di frontend.

### `POST /api/interviews/import/csv`
Import interview schedule dari CSV.

### `POST /api/interviews/import/ocr`
Import interview schedule dari hasil OCR gambar.

### `POST /api/candidates/import/csv`
Import kandidat massal.

## 10. MVP Endpoint Priority

Kalau ingin mulai dari paling penting dulu, saya sarankan urutannya:

1. `POST /api/auth/login`
2. `GET /api/auth/me`
3. `GET /api/recruiter/candidates`
4. `POST /api/candidates`
5. `GET /api/candidates/:candidateId`
6. `PATCH /api/candidates/:candidateId`
7. `POST /api/recruiter/candidates/:candidateId/process`
8. `GET /api/sales/candidates`
9. `POST /api/sales/candidates/:candidateId/process`
10. `GET /api/interviews`
11. `PATCH /api/interviews/:interviewId`
12. `GET /api/dashboard`

## 11. Notes for Implementation

- Sebaiknya API memakai `snake_case` di database dan `camelCase` di response JSON.
- Stage recruiter dan sales tetap lebih aman disimpan sebagai kode backend, lalu frontend mengubah jadi label UI.
- `POST /api/recruiter/candidates/:candidateId/process` dan `POST /api/sales/candidates/:candidateId/process` sebaiknya dijalankan dalam transaction database.
- Validasi role penting:
  - recruiter tidak boleh memproses endpoint sales
  - sales tidak boleh memproses endpoint recruiter
  - super admin boleh akses semua
- Untuk file upload, lebih aman jika file di-store sebagai object storage path atau file path, bukan blob langsung di MySQL.
