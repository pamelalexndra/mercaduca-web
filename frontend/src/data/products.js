//Esto se remplaza con una API o la BD

const makeProduct = (i, tag = "New") => ({
  id: `p-${tag}-${i}`,
  name: `Nombre del producto ${i}`,
  price: `$${(i * 7 + 9).toFixed(0)}`,
  category: "Category",
});

export const NEW_PRODUCTS = Array.from({ length: 12 }, (_, i) =>
  makeProduct(i + 1, "New")
);
export const BEST_SELLERS = Array.from({ length: 12 }, (_, i) =>
  makeProduct(i + 1, "Best")
);
export const ALL_PRODUCTS = Array.from({ length: 16 }, (_, i) =>
  makeProduct(i + 1, "All")
);
export const CATEGORIES = [ "Productos de belleza",
    "Snacks",
    "Coleccionables",
    "Productos deportivos",
    "Papelería",
    "Skincare",
    "Accesorios",
  ];