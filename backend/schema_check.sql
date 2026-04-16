-- Copy and paste this entirely into your Supabase Dashboard -> SQL Editor and hit RUN.

-- 1. Create medicationLogs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."medicationLogs" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "patientId" UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    "prescriptionId" UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    "doctorId" UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    "status" TEXT NOT NULL CHECK (status IN ('Pending', 'Taken', 'Missed')),
    "scheduledDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "takenAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Make sure patients has necessary fields
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS "doctorId" UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS "age" INTEGER,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 3. Make sure prescriptions has necessary fields
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS "patientId" UUID REFERENCES public.patients(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "doctorId" UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "medicineName" TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS "dosage" TEXT,
ADD COLUMN IF NOT EXISTS "timing" TEXT,
ADD COLUMN IF NOT EXISTS "customTiming" TEXT,
ADD COLUMN IF NOT EXISTS "duration" TEXT,
ADD COLUMN IF NOT EXISTS "instructions" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
