export type LayerType = "text" | "social" | "price" | "logo" | "image" | "badge";

export interface TextLayer {
  id: string;
  fieldKey?: string;
  type: LayerType;
  text: string;
  posX: number;
  posY: number;
  width?: number | string;
  height?: number | string;
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  fontFamily: string;
  shadow: boolean;
  badgeStyle?: number; 
}

export type AnimationType = 'suave' | 'energetico' | 'cinematografico' | 'minimalista';

export interface RemotionTemplateProps {
  imageUrl: string;
  layers: TextLayer[];
  formato: string;
  animationType?: AnimationType;
  menuData?: {
    isMenuMode: boolean;
    menuItems: { name: string; price: string; desc?: string }[];
    scale?: number;
    bgColor?: string;
    bgOpacity?: number;
    posX?: number;
    posY?: number;
    width?: number;
    customZ?: number;
    // Agregamos soporte para otras columnas si existen
    menuItems2?: { name: string; price: string; desc?: string }[];
    menuItems3?: { name: string; price: string; desc?: string }[];
    visible?: boolean;
    visible2?: boolean;
    visible3?: boolean;
    scale2?: number;
    scale3?: number;
    posX2?: number;
    posY2?: number;
    posX3?: number;
    posY3?: number;
    width2?: number;
    width3?: number;
  };
}
