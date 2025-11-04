-- Crear la tabla Categorias
CREATE TABLE Categorias (
  id_categoria SERIAL PRIMARY KEY NOT NULL, 
  Categoria VARCHAR(100)
);

-- Crear la tabla Emprendimiento
CREATE TABLE Emprendimiento (
  id_emprendimiento SERIAL PRIMARY KEY NOT NULL,
  id_categoria INT,
  Nombre VARCHAR(500),
  Descripcion TEXT, 
  Disponible BOOLEAN DEFAULT TRUE, -- TRUE = disponible, FALSE = no disponible
  Imagen_URL TEXT,
  Instagram TEXT,
  Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_Emprendimiento_Categoria FOREIGN KEY (id_categoria) 
    REFERENCES Categorias(id_categoria)
);

-- Crear la tabla Emprendedor
CREATE TABLE Emprendedor (
  id_emprendedor SERIAL PRIMARY KEY NOT NULL,
  id_emprendimiento INT,
  Nombres VARCHAR(500),
  Apellidos VARCHAR(500),
  Correo TEXT,
  Telefono VARCHAR(8),
  Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_Emprendedor_Emprendimiento FOREIGN KEY (id_emprendimiento) 
    REFERENCES Emprendimiento(id_emprendimiento) ON DELETE CASCADE
);

-- Crear tabla usuarios
CREATE TABLE Usuarios (
	id_usuario SERIAL PRIMARY KEY NOT NULL,
	id_emprendedor INT, 
	Usuario VARCHAR(100) UNIQUE NOT NULL, 
	Contraseña TEXT, 
	Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_Usuarios_Emprendedor FOREIGN KEY (id_emprendedor) 
		REFERENCES Emprendedor (id_emprendedor) ON DELETE CASCADE
);

-- Crear la tabla Producto
CREATE TABLE Producto(
  id_producto SERIAL PRIMARY KEY NOT NULL,
  id_emprendimiento INT,
  id_categoria INT,
  Nombre VARCHAR(500),
  Descripcion TEXT,
  Imagen_URL TEXT, 
  Precio_dolares DECIMAL(18,2),
  Existencias INT,
  Disponible BOOLEAN DEFAULT TRUE, -- TRUE = disponible, FALSE = no disponible
  Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_Producto_Emprendimiento FOREIGN KEY (id_emprendimiento) 
    REFERENCES Emprendimiento(id_emprendimiento) ON DELETE CASCADE,
  CONSTRAINT fk_Producto_Categoria FOREIGN KEY (id_categoria) 
    REFERENCES Categorias(id_categoria)
);

-- Crear tabla actividades
CREATE TABLE Actividades (
	id_actividad SERIAL PRIMARY KEY NOT NULL,
	Nombre VARCHAR(500), 
	Descripcion TEXT, 
	Imagen_url TEXT
);

-- Insertar categorías
INSERT INTO Categorias (Categoria) VALUES 
('Alimentos y bebidas.'),
('Coleccionables'),
('Automotriz.'),
('Cocina y utensilios.'),
('Cosmeticos.'),
('Deportes.'),
('Ferreteria y jardin.'),
('Higiene.'),
('Hogar y decoracion.'),
('Infantiles.'),
('Joyeria'),
('Juguetes.'),
('Papeleria y oficina.'),
('Limpieza.'),
('Mascotas.'),
('Regalos y ocasiones.'),
('Ropa.'),
('Salud y bienestar.'),
('Skincare.'),
('Tecnologia.'),
('Viajes.');

INSERT INTO Emprendimiento (id_categoria, Nombre, Descripcion, Imagen_URL, Instagram) 
VALUES (1, 'Jochips','Deliciosas galletas artesanales horneadas con ingredientes de calidad, perfectas para acompañar tu café o antojo dulce.','https://i.ibb.co/MDj4kqrt/jochips.jpg', 'https://www.instagram.com/jochipsco/'),
(11, 'Evy Fantasy', 'Joyería única y accesorios elaborados con diseños creativos.', 'https://i.ibb.co/qLKJCtwd/evyfantasy.jpg', 'https://www.instagram.com/evyfantasy24.sv/'),
(11, 'Meowfa', 'Encantadores accesorios y artículos que combinan diversión y utilidad en cada producto.', 'https://i.ibb.co/xqC3DDxT/meowfa.jpg', 'https://www.instagram.com/meowfa_sv/'),
(1, 'Es De Café', 'Café de variedades puras | Pacamara | Bourbon | Geisha | Icatu | Dulces de café | Licores de café | coffee box.', 'https://i.ibb.co/8LrFDvdC/cafe.jpg', 'https://www.instagram.com/esdecafe.sv/'),
(1, 'Mascabado', 'Delicioso y original. Postres | Pasteles | Galletas | y más', 'https://i.ibb.co/jvmT1scP/mascabado.jpg', 'https://www.instagram.com/mascabado.sv/'),
(11, 'Two Lux', 'Joyería de acero inoxidable.', 'https://i.ibb.co/sdhTG4g1/twolux.jpg', 'https://www.instagram.com/twolux_sv/'),
(11, 'Bleuciel', '¡Lleva contigo la energía de las piedras naturales y eleva tu estilo!', 'https://i.ibb.co/M5ctvDyq/bleuciel.jpg', 'https://www.instagram.com/bleucielsv/'),
(11, 'Nilitos', 'Pulseras artesanales perfectas para looks casuales y formales.', 'https://i.ibb.co/Fkhk5q1j/nilitos.jpg', 'https://www.instagram.com/nilitos_sv/'), 
(17, 'Guty', 'Donde nuestro límite es tu imaginación. Diseñador gráfico freelancer. Cotiza tus diseños digitales y productos personalizados con nosotros.', 'https://i.ibb.co/d06Zjjbq/guty.jpg', 'https://www.instagram.com/guty_disennio/'),
(2, 'Kithsune', 'Desde Japón a tu casa Anime | K-pop | Series | Videojuegos.', 'https://i.ibb.co/wZ2Vms99/kitsune.jpg', 'https://www.instagram.com/kithsune_sv/'), 
(19, 'Oh My Glow!', 'Productos de skincare efectivos y asequibles para cuidar tu piel con ingredientes de calidad.', 'https://i.ibb.co/TM4dfst1/ohmyglow.jpg', 'https://www.instagram.com/ohmyglow.sv/'), 
(11, 'Ambar by Sof', 'Joyería  hechas a mano de acero inoxidable y piedras preciosas.', 'https://i.ibb.co/5hZkcRSX/ambar.jpg', 'https://www.instagram.com/ambar_bysof/'), 
(2, 'Tannie Go´s', 'Desde juguetes coleccionables hasta accesorios para amantes del K-pop.', 'https://i.ibb.co/YFtp8pzb/tannie.jpg', 'https://www.instagram.com/tanniegos/'), 
(2, 'Chery Bun Bun', 'Pasteles eternos | Decoden', 'https://i.ibb.co/PGjGPJH2/cherybunbun.jpg', 'https://www.instagram.com/cherybunbun.sv/'), 
(2, 'Crochetique', 'Productos tipo croché personalizables con temática de videojuegos, actores, películas y más.', 'https://i.ibb.co/9k8VdTD2/crochetique.jpg', 'https://www.instagram.com/crochetiquesv/'), 
(11, 'Resinas Surua', 'Joyería de resina y flores.', 'https://i.ibb.co/8W9mY77/surua.jpg', 'https://www.instagram.com/resinas_surua/'), 
(2, '¡Qué Chingón!', 'Pines y ropa que no solo decoran, ¡cuentan historias! Tus pines favoritos los encuentras en ¡Qué Chingón!.', 'https://i.ibb.co/Vc3CnSQ3/quechingon.jpg', 'https://www.instagram.com/quechingonsv/'),
(1, 'Le Sweet', 'Tienda de postres y brownies con chocolate 100% semi-amargo', 'https://i.ibb.co/QjC2y4s6/lesqwet.jpg', 'https://www.instagram.com/lesweet_sv/'), 
(1, 'Oh My Snack!', '¡Explota de sabor! | 100% antojo | Snacks dulces y salados con estilo.', 'https://i.ibb.co/DPXcQjRG/snack.jpg', 'https://www.instagram.com/ohmysnack_sv/'), 
(1, 'Dulzea', 'Horneando deseos! Pasteles y postres personalizados hasta la puerta de tu casa.', 'https://i.ibb.co/BVwvFySJ/dulzea.jpg', 'https://www.instagram.com/dulzea_sv/'), 
(2, 'Pixelari', 'Productos tipo 16-bits PÍXEL ART con temática de videojuegos, anime, películas y más. Lo mejor del arte en pixeles llega de la pantalla al mundo real.', 'https://i.ibb.co/7N64jyz5/pixelari.jpg', 'https://www.instagram.com/pixelari.sv/'), 
(6, 'GYM Essentials', 'Accesorios para gym. Los mejores accesorios para tus entrenamientos.', 'https://i.ibb.co/FksRgcWQ/gym.jpg', 'https://www.instagram.com/gym_essentials.sv/'), 
(1, 'NubaBakes', 'Postres artesanales recién salidos del horno a su mesa.', 'https://i.ibb.co/Y4ryhDPp/nuba.jpg', 'https://www.instagram.com/nubabakes.sv/'), 
(2, 'Ma Shu', 'Productos de tela hechos a mano.', 'https://i.ibb.co/xKGqsWWW/mashu.jpg', 'https://www.instagram.com/sv.mashu/'), 
(2, 'Mari José Designs', 'Pequeños bordados a mano para que decoren tu hogar y te acompañen en tu vida, para madres y bebes', 'https://i.ibb.co/JWrsv2YS/Marijose.jpg', 'https://www.instagram.com/mariajosdesigns/'), 
(2, 'Pam Products', 'Soluciones de organización con diseño atractivo para mantener tus pertenencias en orden.', 'https://i.ibb.co/tMPS5kpS/pam.jpg', 'https://www.instagram.com/pamproductsv/'), 
(2, 'Klinto Store', 'Venta de accesorios de cultura popular. Un pin, mil historias.', 'https://i.ibb.co/cKr1JFRx/klinto.jpg', 'https://www.instagram.com/_klinto_store_/'), 
(5, 'Nail´s El Salvador', 'Wraps para uñas, diseños perfectos, duración de hasta 3 semanas!.', 'https://i.ibb.co/GfH2yJSN/nails.jpg', 'https://www.instagram.com/nails.wraps/'), 
(16, 'Lizbeth Shopkins', 'Globos, Huevos y más... Todo lo que se necesita para una fiesta.', 'https://i.ibb.co/Jw8fhzNV/lisbeth.jpg', 'https://www.instagram.com/lizbethshopkins/'), 
(2, 'Elfos Verdes', 'Compras y ventas minoristas, se venden productos que posiblemente no necesitas, pero seguro te van a gustar,', 'https://i.ibb.co/wZwwWHsR/elfos.jpg', 'https://www.instagram.com/elfosverdes/');

INSERT INTO Producto (id_emprendimiento, id_categoria, Nombre, Descripcion, Imagen_URL, Precio_dolares, Existencias)
VALUES ((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Jochips'),  1, 'Galletas edición clásicas', '', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlNNhU3GusCR5R8Fs8QPLWkkGDghEsLxSrNA&s', 0.75, 15),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Jochips'),  1, 'Galletas edición premium', '', 'https://i.ibb.co/3mzHFpKs/Galletas-premium.png', 1.00, 20),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Evy Fantasy'),  11, 'Pulseras', '', 'https://i.ibb.co/XrPJrxSb/Pulsera.png', 5.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Evy Fantasy'),  11, 'Aretes', '', 'https://i.ibb.co/99m73gs2/Aretes.png', 1.50, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Evy Fantasy'),  11, 'Cadenas', '', 'https://i0.wp.com/joyeriacasadeoro.com/tienda/wp-content/uploads/2024/04/deava-1.jpg?fit=768%2C1016&ssl=1', 5.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Evy Fantasy'),  11, 'Anillos', '', 'https://i.ibb.co/WNxXXFk2/Anillo.png', 3.50, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Evy Fantasy'),  11, 'Collares', '', 'https://i.ibb.co/S7x3pxn8/Collar.png', 3.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Evy Fantasy'),  11, 'Brazaletes ', '', 'https://cdn-media.glamira.com/media/product/newgeneration/view/1/sku/hermina/alloycolour/yellow.jpg', 4.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  12, 'Peluches grandes', '', 'https://i.ibb.co/ycYcmcDC/Peluche-grande.png', 23.00, 4),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  2, 'Llaveros', '', 'https://www.melodrama.com.ar/8002-large_default/llaveros-personajes.jpg', 2.00, 20),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  12, 'Peluches medianos', '', 'https://i.ibb.co/27STfPNy/Peluche-mediano.png', 10.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  11, 'Ganchos para cabello', '', 'https://thecomicstore.com.sv/storage/products/quFPKKD7RNRp1ypO1loTunykyX6K4RRVzYiayLYv.jpg', 1.50, 12),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  5, 'Espejos de mano', '', 'https://solocejas.com.co/wp-content/uploads/2022/06/espejos.jpg', 2.00, 15),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  12, 'Peluches pequeños', '', 'https://i.ibb.co/LXLVg3gh/Peluche-peque-o.png', 7.00, 8),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  8, 'Lociones pequeñas', '', 'https://m.media-amazon.com/images/I/71A-HJvY0hL._UF1000,1000_QL80_.jpg', 3.00, 6),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Meowfa'),  11, 'Monederos', '', 'https://manhattanxativa.es/wp-content/uploads/2024/05/MONEDERO-STITCH-e1715684150443.jpg', 2.50, 6),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café bourbon', '', 'https://i.ibb.co/DDbjwXxF/Bourbon.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café cuscatleco', '', 'https://i.ibb.co/99JDZmrL/cuscatleco.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café icatu', '', 'https://i.ibb.co/4Zrdwp5h/Icatu.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café blend', '', 'https://i.ibb.co/R5FkTFB/Blend.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café pacas', '', 'https://i.ibb.co/mV9NL6TB/Pacas.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café geisha', '', 'https://i.ibb.co/wF7v1XBc/Geisha.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Café pacamara', '', 'https://i.ibb.co/8nkPcxwf/Pacamara.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Es De Café'),  1, 'Horchata de café', '', 'https://i.ibb.co/G4J51FkF/horchata.png', 7.00, 25),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Mascabado'),  1, 'Brownies', '', 'https://www.aceitesdeolivadeespana.com/wp-content/uploads/2019/03/brownies-de-chocolate-1000x768.png', 2.50, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Mascabado'),  1, 'Pasteles', '', 'https://i.pinimg.com/736x/6e/88/33/6e8833a3bf3bc7b1efab315b15a64aaa.jpg', 12.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Mascabado'),  1, 'Alfajores', '', 'https://elmundoeats.es/wp-content/uploads/2021/07/FP2-Argentine-alfajores-on-a-rack-500x500.jpg', 3.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Mascabado'),  1, 'Muffins', '', 'https://i.ibb.co/HfT09ZpM/Muffins.png', 4.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Mascabado'),  1, 'Tartaletas', '', 'https://i.pinimg.com/474x/9b/86/b8/9b86b8d071b4d4f3d9b333f34f8e7cd2.jpg', 5.50, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Two Lux'),  11, 'Anillos', '', 'https://i.ibb.co/TBLTG66y/Anillos.png', 4.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Two Lux'),  11, 'Collares', '', 'https://i.ibb.co/M5PYfp9H/Collar.png', 7.50, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Two Lux'),  11, 'Aritos', '', 'https://i.ibb.co/whJNg0L1/Aritos.png', 3.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Two Lux'),  11, 'Pulseras', '', 'https://i.ibb.co/pBfK2Jts/Pulsera.png', 5.50, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Bleuciel'),  11, 'Pulseras duo', '', 'https://moonstone-gt.com/cdn/shop/products/Screenshot_20230323_103632_SHEIN.jpg?v=1679589480', 5.00, 3),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Bleuciel'),  11, 'Pulseras tejidas', '', 'https://i.ibb.co/dJtWQsB9/Tejidas.png', 5.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Bleuciel'),  11, 'Pulseras de piedras naturales', '', 'https://i.ibb.co/q3x9wnyF/Piedras-naturales.png', 8.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Bleuciel'),  11, 'Pulseras de mostacilla', '', 'https://i.ibb.co/XZ4KB71c/Mostacilla.png', 3.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Bleuciel'),  11, 'Pulseras de cristales', '', 'https://i.ibb.co/Q7RPCRsV/Cristales.png', 10.00, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Nilitos'),  11, 'Anillos', '', 'https://i.ibb.co/JRCnbgPT/Anillos.png', 1.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Nilitos'),  11, 'Collares', '', 'https://i.ibb.co/N2bHJgbK/Collar.png', 3.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Nilitos'),  11, 'Pulseras', '', 'https://i.ibb.co/QvShCFMg/Pulsera.png', 6.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Guty'),  17, 'Calcetines temáticos', '', 'https://i.ibb.co/k64JDtsh/Calcetines-tematicos.jpg', 4.00, 1),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Guty'),  17, 'Calcetas temáticas', '', 'https://i.etsystatic.com/34775201/r/il/ef9419/6248138677/il_fullxfull.6248138677_8tnp.jpg', 2.25, 5),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Guty'),  17, 'Camisas teñidas en añil', '', 'https://exporta.sv/wp-content/uploads/2025/05/CAMISETA-ANIL-5.jpeg', 22.50, 3),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Guty'),  16, 'Imanes salvadoreños', '', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRohihOPv8Lq6vYYfp3CP1y0yRAKgkBVGFHgLSYJlhuBeQwgMh80dRKc8BC6tKPHXR7-Iw&usqp=CAU', 2.00, 4),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Guty'),  16, 'Imanes temáticos', '', 'https://i.ibb.co/pjJW8SbC/Iman-tematico.jpg', 1.50, 17),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Kithsune'),  2, 'Figuras de Genshin Impact', '', 'https://i.ibb.co/1J0BwmsY/Genshin.png', 25.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Kithsune'),  2, 'Figura de One Piece', '', 'https://i.ibb.co/Jj2LL9tq/Onepiece.png', 50.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Kithsune'),  2, 'Figuras de My Hero Academia', '', 'https://i.ibb.co/rGpn2VzG/myheroacademia.png', 30.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Kithsune'),  2, 'Figura de Link', '', 'https://i.ibb.co/ch6rrNfJ/Link.png', 45.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Kithsune'),  2, 'Figuras de DanDaDan', '', 'https://i.ibb.co/DDH7r1JV/DanDaDan.png', 50.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Oh My Glow!'),  19, 'Mascarillas', '', 'https://i.ibb.co/j976qM3f/Mascarilla.png', 5.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Oh My Glow!'),  19, 'Bloqueadores', '', 'https://i.ibb.co/Pzj5pf4k/Bloqueador.png', 8.50, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Oh My Glow!'),  5, 'Labiales', '', 'https://siman.vtexassets.com/arquivos/ids/5181151-800-800?v=638434621264570000&width=800&height=800&aspect=true', 4.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Oh My Glow!'),  19, 'Limpiadores', '', 'https://i.ibb.co/XZJrztGV/Limpiador.png', 7.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Oh My Glow!'),  19, 'Hidratantes', '', 'https://i.ibb.co/B5TWK34y/Hidratante.png', 12.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Ambar by Sof'),  11, 'Collares', '', 'https://i.ibb.co/d02XVvYt/Collar.png', 16.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Ambar by Sof'),  11, 'Aritos', '', 'https://i.ibb.co/jvF5Hj5n/Aritos.png', 10.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Ambar by Sof'),  11, 'Pulseras', '', 'https://i.ibb.co/mFFjLTZJ/Pulsera.png', 12.00, 10),
((SELECT id_emprendimiento FROM Emprendimiento WHERE Nombre = 'Tannie Go´s'),  19, 'Hidratantes', '', 'https://i.ibb.co/B5TWK34y/Hidratante.png', 12.00, 10);