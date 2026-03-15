import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all terrains
    const terrains = await db.terrain.findMany();

    // General statistics
    const totalTerrains = terrains.length;
    const uniqueIlots = new Set(terrains.map(t => t.ilot)).size;
    // Count unique ilot+lot combinations since lots can have same number in different ilots
    const uniqueLotCombinations = new Set(terrains.map(t => `${t.ilot}-${t.lot}`)).size;
    const availableLots = terrains.filter(t => t.statut === 'Dispo').length;
    const soldLots = terrains.filter(t => t.statut === 'Vendu').length;
    const acdLots = terrains.filter(t => t.tp === 'ACD').length;
    const nbncLots = terrains.filter(t => t.nature === 'NBNC').length;
    const nbcLots = terrains.filter(t => t.nature === 'NBC').length;
    const lotsNonBatis = nbncLots + nbcLots;

    // Statistics by group
    const byGroup: Record<string, { available: number; sold: number }> = {};
    const groups = [...new Set(terrains.map(t => t.groupe).filter(Boolean))];
    for (const group of groups) {
      byGroup[group || ''] = {
        available: terrains.filter(t => t.groupe === group && t.statut === 'Dispo').length,
        sold: terrains.filter(t => t.groupe === group && t.statut === 'Vendu').length,
      };
    }

    // Statistics by sector
    const bySector: Record<string, { available: number; sold: number }> = {};
    const sectors = [...new Set(terrains.map(t => t.secteur).filter(Boolean))];
    for (const sector of sectors) {
      bySector[sector || ''] = {
        available: terrains.filter(t => t.secteur === sector && t.statut === 'Dispo').length,
        sold: terrains.filter(t => t.secteur === sector && t.statut === 'Vendu').length,
      };
    }

    // Statistics by execution
    const byExecution: Record<string, { available: number; sold: number }> = {};
    const executions = [...new Set(terrains.map(t => t.execution).filter(Boolean))];
    for (const exec of executions) {
      byExecution[exec || ''] = {
        available: terrains.filter(t => t.execution === exec && t.statut === 'Dispo').length,
        sold: terrains.filter(t => t.execution === exec && t.statut === 'Vendu').length,
      };
    }

    // Statistics by nature
    const byNature: Record<string, { available: number; sold: number }> = {};
    const natures = [...new Set(terrains.map(t => t.nature).filter(Boolean))];
    for (const nature of natures) {
      byNature[nature || ''] = {
        available: terrains.filter(t => t.nature === nature && t.statut === 'Dispo').length,
        sold: terrains.filter(t => t.nature === nature && t.statut === 'Vendu').length,
      };
    }

    // Statistics by TP
    const byTP: Record<string, { available: number; sold: number }> = {};
    const tps = [...new Set(terrains.map(t => t.tp).filter(Boolean))];
    for (const tp of tps) {
      byTP[tp || ''] = {
        available: terrains.filter(t => t.tp === tp && t.statut === 'Dispo').length,
        sold: terrains.filter(t => t.tp === tp && t.statut === 'Vendu').length,
      };
    }

    // Statistics by PubJO
    const byPubJO: Record<string, { available: number; sold: number }> = {};
    const pubJOs = [...new Set(terrains.map(t => t.pubJO).filter(Boolean))];
    for (const pubJO of pubJOs) {
      byPubJO[pubJO || ''] = {
        available: terrains.filter(t => t.pubJO === pubJO && t.statut === 'Dispo').length,
        sold: terrains.filter(t => t.pubJO === pubJO && t.statut === 'Vendu').length,
      };
    }

    return NextResponse.json({
      general: {
        totalTerrains,
        uniqueIlots,
        uniqueLots: uniqueLotCombinations,
        availableLots,
        soldLots,
        acdLots,
        lotsNonBatis,
      },
      byGroup,
      bySector,
      byExecution,
      byNature,
      byTP,
      byPubJO,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Error fetching statistics' }, { status: 500 });
  }
}
