import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clearExisting = formData.get('clearExisting') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get the first sheet or the main data sheet
    let sheetName = workbook.SheetNames[0];
    for (const name of workbook.SheetNames) {
      if (name.includes('GLOBAL') || name.includes('Terrains') || name.includes('DATA') || name.includes('FICHIER')) {
        sheetName = name;
        break;
      }
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return NextResponse.json({ error: 'No data found in the file' }, { status: 400 });
    }

    // Column mapping
    const columnMapping: Record<string, string> = {
      'ilots': 'ilot', 'ilot': 'ilot', 'numéro de l\'ilot': 'ilot', 'numero ilot': 'ilot',
      'lots': 'lot', 'lot': 'lot', 'numéro du lot': 'lot', 'numero lot': 'lot',
      'groupe': 'groupe', 'group': 'groupe',
      'section': 'secteur', 'secteur': 'secteur', 'sect': 'secteur',
      'parcelle': 'parcelle', 'parcel': 'parcelle',
      'execution': 'execution', 'exécution': 'execution', 'exec': 'execution',
      'etat': 'etat', 'état': 'etat', 'state': 'etat',
      'titre foncier': 'titreFoncier', 'titrefoncier': 'titreFoncier',
      'tp': 'tp',
      'n° titre prop': 'numeroTitreProp', 'numero titre': 'numeroTitreProp',
      'n° titre de propriété': 'numeroTitreProp', 'n° titre propriété': 'numeroTitreProp',
      'annee': 'annee', 'année': 'annee', 'year': 'annee',
      'pubjo': 'pubJO', 'pub jo': 'pubJO',
      'date': 'dateJO', 'datejo': 'dateJO',
      'nature': 'nature',
      'immatriculation': 'imm', 'imm': 'imm', 'surface': 'imm',
      'possesseur': 'possesseur', 'possesseur/détenteur': 'possesseur', 'owner': 'possesseur',
      'contact': 'contact', 'email': 'email',
      'statut': 'statut', 'status': 'statut',
    };

    const cleanStr = (val: unknown): string | null => {
      if (val === undefined || val === null || val === '' || val === ' ') return null;
      return String(val).trim() || null;
    };

    const cleanNum = (val: unknown): number | null => {
      if (val === undefined || val === null || val === '' || val === ' ') return null;
      const n = parseInt(String(val));
      return isNaN(n) ? null : n;
    };

    const findColumn = (row: Record<string, unknown>, targetField: string): unknown => {
      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = key.toLowerCase().trim();
        if (columnMapping[normalizedKey] === targetField) return value;
      }
      return null;
    };

    // Clear existing data if requested
    if (clearExisting) {
      await db.terrain.deleteMany({});
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of data as Record<string, unknown>[]) {
      try {
        const ilot = cleanNum(findColumn(row, 'ilot')) || 0;
        const lot = cleanNum(findColumn(row, 'lot')) || 0;

        if (ilot === 0 && lot === 0) {
          skipped++;
          continue;
        }

        // Check for duplicates if not clearing
        if (!clearExisting) {
          const existing = await db.terrain.findFirst({ where: { ilot, lot } });
          if (existing) {
            skipped++;
            continue;
          }
        }

        const etat = cleanStr(findColumn(row, 'etat'));
        let statut = cleanStr(findColumn(row, 'statut')) || 'Dispo';
        if (statut?.toLowerCase() === 'disponible' || statut?.toLowerCase() === 'available') statut = 'Dispo';
        if (statut?.toLowerCase() === 'diponible') statut = 'Dispo';
        if (['L', 'L55', 'N'].includes(etat || '')) statut = 'Vendu';

        await db.terrain.create({
          data: {
            ilot, lot,
            groupe: cleanStr(findColumn(row, 'groupe')),
            secteur: cleanStr(findColumn(row, 'secteur')),
            parcelle: cleanNum(findColumn(row, 'parcelle')),
            execution: cleanStr(findColumn(row, 'execution')),
            etat,
            titreFoncier: cleanStr(findColumn(row, 'titreFoncier')),
            tp: cleanStr(findColumn(row, 'tp')),
            numeroTitreProp: cleanStr(findColumn(row, 'numeroTitreProp')),
            annee: cleanNum(findColumn(row, 'annee')),
            pubJO: cleanStr(findColumn(row, 'pubJO')),
            dateJO: cleanStr(findColumn(row, 'dateJO')),
            nature: cleanStr(findColumn(row, 'nature')),
            imm: cleanStr(findColumn(row, 'imm')),
            possesseur: cleanStr(findColumn(row, 'possesseur')),
            contact: cleanStr(findColumn(row, 'contact')),
            email: cleanStr(findColumn(row, 'email')),
            statut,
          },
        });
        imported++;
      } catch (e) {
        errors++;
      }
    }

    const total = await db.terrain.count();

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      totalInDatabase: total,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
