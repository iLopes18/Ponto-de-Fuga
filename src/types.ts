/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  year: string;
  link?: string;
}

export type SpaceSection = 
  | 'vazio'            // White luminous fog, with Name "ISAAC LOPES" (Ponto de Fuga)
  | 'encruzilhada-1'   // Intersection 1: Left ("Retratos"), Right ("Desporto"), Forward ("Encruzilhada 2"), Back ("Ponto de Fuga")
  | 'encruzilhada-2'   // Intersection 2: Left ("Paisagens"), Right ("Arquitetura"), Forward ("Sobre & Contacto"), Back ("Encruzilhada 1")
  | 'retratos'         // Retratos gallery
  | 'desporto'         // Desporto gallery
  | 'paisagens'        // Paisagens gallery
  | 'arquitetura'      // Arquitetura gallery
  | 'sobre-contacto';   // Minimalist about/interactive contact section
