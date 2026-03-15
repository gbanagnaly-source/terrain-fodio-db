import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const terrain = await db.terrain.findUnique({
      where: { id },
    });

    if (!terrain) {
      return NextResponse.json({ error: 'Terrain not found' }, { status: 404 });
    }

    return NextResponse.json(terrain);
  } catch (error) {
    console.error('Error fetching terrain:', error);
    return NextResponse.json({ error: 'Error fetching terrain' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const terrain = await db.terrain.update({
      where: { id },
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
    console.error('Error updating terrain:', error);
    return NextResponse.json({ error: 'Error updating terrain' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.terrain.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting terrain:', error);
    return NextResponse.json({ error: 'Error deleting terrain' }, { status: 500 });
  }
}
