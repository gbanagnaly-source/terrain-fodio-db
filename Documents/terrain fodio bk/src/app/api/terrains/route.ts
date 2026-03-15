import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ilot = searchParams.get('ilot');
    const lot = searchParams.get('lot');
    const groupe = searchParams.get('groupe');
    const secteur = searchParams.get('secteur');
    const execution = searchParams.get('execution');
    const nature = searchParams.get('nature');
    const tp = searchParams.get('tp');
    const pubJO = searchParams.get('pubJO');
    const statut = searchParams.get('statut');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (ilot) where.ilot = parseInt(ilot);
    if (lot) where.lot = parseInt(lot);
    if (groupe) where.groupe = groupe;
    if (secteur) where.secteur = secteur;
    if (execution) where.execution = execution;
    if (nature) where.nature = nature;
    if (tp) where.tp = tp;
    if (pubJO) where.pubJO = pubJO;
    if (statut) where.statut = statut;

    if (search) {
      where.OR = [
        { possesseur: { contains: search } },
        { contact: { contains: search } },
        { email: { contains: search } },
        { titreFoncier: { contains: search } },
        { numeroTitreProp: { contains: search } },
      ];
    }

    const terrains = await db.terrain.findMany({
      where,
      orderBy: [{ ilot: 'asc' }, { lot: 'asc' }],
    });

    console.log(`API /api/terrains: Returning ${terrains.length} terrains`);
    return NextResponse.json(terrains);
  } catch (error) {
    console.error('Error fetching terrains:', error);
    return NextResponse.json({ error: 'Error fetching terrains' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const terrain = await db.terrain.create({
      data: {
        ilot: parseInt(body.ilot),
        lot: parseInt(body.lot),
        groupe: body.groupe || null,
        secteur: body.secteur || null,
        parcelle: body.parcelle ? parseInt(body.parcelle) : null,
        execution: body.execution || null,
        etat: body.etat || null,
        titreFoncier: body.titreFoncier || null,
        tp: body.tp || null,
        numeroTitreProp: body.numeroTitreProp || null,
        annee: body.annee ? parseInt(body.annee) : null,
        pubJO: body.pubJO || null,
        dateJO: body.dateJO || null,
        nature: body.nature || null,
        imm: body.imm || null,
        possesseur: body.possesseur || null,
        contact: body.contact || null,
        email: body.email || null,
        statut: body.statut || 'Dispo',
      },
    });

    return NextResponse.json(terrain);
  } catch (error) {
    console.error('Error creating terrain:', error);
    return NextResponse.json({ error: 'Error creating terrain' }, { status: 500 });
  }
}
