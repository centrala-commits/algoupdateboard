import { supabase } from "./supabase.js";

// ---------------------------------------------------------------------------
// Data-access layer: maps the app's camelCase shape <-> Postgres snake_case,
// and wraps the Supabase CRUD calls. Only used when dbEnabled.
// ---------------------------------------------------------------------------

const driverFromRow = (r) => ({
  id: r.id,
  companyId: r.company_id,
  name: r.name,
  truck: r.truck,
  eldId: r.eld_id,
  status: r.status,
  eldActive: r.eld_active,
  location: r.location,
  deliveryDate: r.delivery_date,
  isReviewed: r.is_reviewed,
  updatedBy: r.updated_by,
  updatedAt: r.updated_at,
  notes: r.notes ?? "",
});

// Map a partial camelCase driver patch to a snake_case row.
const driverToRow = (p) => {
  const map = {
    companyId: "company_id",
    name: "name",
    truck: "truck",
    eldId: "eld_id",
    status: "status",
    eldActive: "eld_active",
    location: "location",
    deliveryDate: "delivery_date",
    isReviewed: "is_reviewed",
    updatedBy: "updated_by",
    updatedAt: "updated_at",
    notes: "notes",
  };
  const row = {};
  for (const [k, v] of Object.entries(p)) if (k in map) row[map[k]] = v;
  return row;
};

export async function loadAll() {
  const [companies, updaters, drivers] = await Promise.all([
    supabase.from("companies").select("*").order("id"),
    supabase.from("updaters").select("*").order("id"),
    supabase.from("drivers").select("*").order("id"),
  ]);
  const err = companies.error || updaters.error || drivers.error;
  if (err) throw err;
  return {
    companies: companies.data,
    updaters: updaters.data,
    drivers: (drivers.data || []).map(driverFromRow),
  };
}

export async function dbAddCompany({ name, board }) {
  const { data, error } = await supabase.from("companies").insert({ name, board }).select().single();
  if (error) throw error;
  return data;
}

export async function dbDeleteCompany(id) {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}

export async function dbAddDriver(d) {
  const { data, error } = await supabase
    .from("drivers")
    .insert({
      company_id: d.companyId,
      name: d.name,
      truck: d.truck,
      eld_id: d.eldId,
      status: "All good",
      eld_active: false,
      location: "Fetching…",
      is_reviewed: false,
    })
    .select()
    .single();
  if (error) throw error;
  return driverFromRow(data);
}

export async function dbUpdateDriver(id, patch) {
  const { error } = await supabase.from("drivers").update(driverToRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function dbAddUpdater({ nickname, shift }) {
  const { data, error } = await supabase.from("updaters").insert({ nickname, shift }).select().single();
  if (error) throw error;
  return data;
}

export async function dbDeleteUpdater(id) {
  const { error } = await supabase.from("updaters").delete().eq("id", id);
  if (error) throw error;
}

// Bulk-assign a responsible updater to many drivers at once.
export async function dbAssignDrivers(ids, { updatedBy, updatedAt }) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("drivers")
    .update({ updated_by: updatedBy, updated_at: updatedAt })
    .in("id", ids);
  if (error) throw error;
}
