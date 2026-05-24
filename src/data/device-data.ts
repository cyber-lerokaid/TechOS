export type DeviceCategoryData = {
  marcas: string[];
  modelos: Record<string, string[]>;
};

export const DEVICE_DATA: Record<string, DeviceCategoryData> = {
  celular: {
    marcas: ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Asus'],
    modelos: {
      'Apple': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
      'Samsung': ['Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy A54', 'Galaxy A34', 'Galaxy M54', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5'],
      'Motorola': ['Moto Edge 40', 'Moto Edge 30', 'Moto G84', 'Moto G73', 'Moto G54', 'Moto G200', 'Razr 40 Ultra'],
      'Xiaomi': ['Xiaomi 13T Pro', 'Xiaomi 13', 'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12', 'Poco X5 Pro', 'Poco F5'],
      'Asus': ['ROG Phone 7', 'ROG Phone 6', 'Zenfone 10', 'Zenfone 9']
    }
  },
  notebook: {
    marcas: ['Dell', 'HP', 'Lenovo', 'Apple', 'Acer', 'Asus'],
    modelos: {
      'Dell': ['Inspiron 15', 'XPS 13', 'XPS 15', 'Alienware m15', 'G15', 'Latitude', 'Vostro'],
      'HP': ['ProBook', 'EliteBook', 'Pavilion', 'Omen', 'Spectre x360', 'Envy'],
      'Lenovo': ['ThinkPad T14', 'ThinkPad X1 Carbon', 'IdeaPad 3', 'IdeaPad Gaming 3', 'Legion 5', 'Yoga'],
      'Apple': ['MacBook Pro M3', 'MacBook Pro M2', 'MacBook Air M2', 'MacBook Air M1'],
      'Acer': ['Nitro 5', 'Predator Helios', 'Aspire 5', 'Aspire 3', 'Swift 3'],
      'Asus': ['VivoBook', 'ZenBook', 'TUF Gaming', 'ROG Strix']
    }
  },
  desktop: {
    marcas: ['Custom (Montado)', 'Dell', 'HP', 'Lenovo', 'Apple'],
    modelos: {
      'Custom (Montado)': ['PC Gamer', 'PC Escritório', 'Workstation'],
      'Dell': ['OptiPlex', 'XPS Desktop', 'Alienware Aurora', 'Inspiron Desktop'],
      'HP': ['ProDesk', 'EliteDesk', 'Omen Desktop', 'Pavilion Desktop'],
      'Lenovo': ['ThinkCentre', 'IdeaCentre', 'Legion Tower'],
      'Apple': ['iMac', 'Mac mini', 'Mac Studio', 'Mac Pro']
    }
  },
  tablet: {
    marcas: ['Apple', 'Samsung', 'Lenovo', 'Xiaomi', 'Amazon'],
    modelos: {
      'Apple': ['iPad Pro 12.9', 'iPad Pro 11', 'iPad Air 5', 'iPad mini 6', 'iPad 10ª Geração', 'iPad 9ª Geração'],
      'Samsung': ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9', 'Galaxy Tab S8', 'Galaxy Tab S7 FE', 'Galaxy Tab A8', 'Galaxy Tab A7 Lite'],
      'Lenovo': ['Tab P12', 'Tab P11 Pro', 'Tab M10', 'Tab M9', 'Tab M8'],
      'Xiaomi': ['Pad 6', 'Pad 5', 'Redmi Pad'],
      'Amazon': ['Fire HD 10', 'Fire HD 8', 'Fire 7']
    }
  },
  video_game: {
    marcas: ['Sony', 'Microsoft', 'Nintendo', 'Sega'],
    modelos: {
      'Sony': ['PlayStation 5', 'PS4 Pro', 'PS4 Slim', 'PS4 Fat', 'PS3', 'PS2', 'PSP', 'PS Vita'],
      'Microsoft': ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox One Fat', 'Xbox 360'],
      'Nintendo': ['Switch OLED', 'Switch Padrão', 'Switch Lite', 'Wii U', 'Wii', '3DS', '2DS', 'Game Boy Advance'],
      'Sega': ['Mega Drive', 'Master System', 'Dreamcast']
    }
  }
};
