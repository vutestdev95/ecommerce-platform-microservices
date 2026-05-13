import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from '../product-service.module';
import { DataSource } from 'typeorm';
import { Category } from '../domain/entities/category.entity';
import { Product } from '../domain/entities/product.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(ProductServiceModule);
  const dataSource = app.get(DataSource);

  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);

  // ═══ XÓA DATA CŨ ═══
  await productRepo.createQueryBuilder().delete().from(Product).execute();
  await categoryRepo.createQueryBuilder().delete().from(Category).execute();

  console.log('🗑️  Cleared old data');

  // ═══ TẠO 5 CATEGORIES ═══
  const categoriesData = [
    {
      name: 'Điện thoại',
      slug: 'dien-thoai',
      description: 'Smartphone và phụ kiện',
    },
    { name: 'Laptop', slug: 'laptop', description: 'Laptop và phụ kiện' },
    { name: 'Tablet', slug: 'tablet', description: 'Máy tính bảng' },
    {
      name: 'Phụ kiện',
      slug: 'phu-kien',
      description: 'Ốp lưng, sạc, tai nghe',
    },
    { name: 'Đồng hồ', slug: 'dong-ho', description: 'Smartwatch và đồng hồ' },
  ];

  const categories = await categoryRepo.save(
    categoriesData.map((c) => categoryRepo.create(c)),
  );
  console.log(`📁 Created ${categories.length} categories`);

  // ═══ TẠO 50 PRODUCTS ═══
  const phoneProducts = [
    { name: 'iPhone 16 Pro Max 256GB', price: 34990000, sku: 'IP16PM-256' },
    { name: 'iPhone 16 Pro 128GB', price: 28990000, sku: 'IP16P-128' },
    { name: 'iPhone 16 128GB', price: 22990000, sku: 'IP16-128' },
    { name: 'iPhone 15 Pro Max 256GB', price: 29990000, sku: 'IP15PM-256' },
    { name: 'iPhone 15 128GB', price: 19990000, sku: 'IP15-128' },
    { name: 'Samsung Galaxy S25 Ultra', price: 33990000, sku: 'SS-S25U' },
    { name: 'Samsung Galaxy S25+', price: 26990000, sku: 'SS-S25P' },
    { name: 'Samsung Galaxy S25', price: 22990000, sku: 'SS-S25' },
    { name: 'Samsung Galaxy A55', price: 9990000, sku: 'SS-A55' },
    { name: 'Xiaomi 15 Pro', price: 18990000, sku: 'XM-15P' },
  ];

  const laptopProducts = [
    { name: 'MacBook Air M3 13 inch', price: 27990000, sku: 'MBA-M3-13' },
    { name: 'MacBook Air M3 15 inch', price: 32990000, sku: 'MBA-M3-15' },
    { name: 'MacBook Pro M3 Pro 14 inch', price: 48990000, sku: 'MBP-M3P-14' },
    { name: 'MacBook Pro M3 Max 16 inch', price: 72990000, sku: 'MBP-M3M-16' },
    { name: 'Dell XPS 14', price: 35990000, sku: 'DELL-XPS14' },
    { name: 'Dell Inspiron 15', price: 15990000, sku: 'DELL-INS15' },
    { name: 'ASUS ROG Strix G16', price: 32990000, sku: 'ASUS-ROG-G16' },
    { name: 'ASUS Vivobook 15', price: 12990000, sku: 'ASUS-VB15' },
    { name: 'Lenovo ThinkPad X1 Carbon', price: 38990000, sku: 'LN-X1C' },
    { name: 'Lenovo IdeaPad Slim 5', price: 16990000, sku: 'LN-IPS5' },
  ];

  const tabletProducts = [
    { name: 'iPad Pro M4 11 inch', price: 28990000, sku: 'IPADP-M4-11' },
    { name: 'iPad Pro M4 13 inch', price: 38990000, sku: 'IPADP-M4-13' },
    { name: 'iPad Air M2', price: 18990000, sku: 'IPADA-M2' },
    { name: 'iPad 10th Gen', price: 9990000, sku: 'IPAD-10' },
    {
      name: 'Samsung Galaxy Tab S10 Ultra',
      price: 29990000,
      sku: 'SS-TABS10U',
    },
    { name: 'Samsung Galaxy Tab S10+', price: 24990000, sku: 'SS-TABS10P' },
    { name: 'Samsung Galaxy Tab A9', price: 6990000, sku: 'SS-TABA9' },
    { name: 'Xiaomi Pad 7', price: 8990000, sku: 'XM-PAD7' },
    { name: 'Xiaomi Pad 7 Pro', price: 12990000, sku: 'XM-PAD7P' },
    { name: 'Lenovo Tab P12 Pro', price: 15990000, sku: 'LN-TABP12' },
  ];

  const accessoryProducts = [
    { name: 'AirPods Pro 2', price: 6790000, sku: 'AIRPODS-PRO2' },
    { name: 'AirPods 4', price: 3490000, sku: 'AIRPODS-4' },
    { name: 'Apple Watch Ultra 2', price: 21990000, sku: 'AW-ULTRA2' },
    { name: 'Samsung Galaxy Buds 3 Pro', price: 5490000, sku: 'SS-BUDS3P' },
    { name: 'Sạc Apple 20W USB-C', price: 590000, sku: 'APPLE-20W' },
    { name: 'Sạc Samsung 45W', price: 890000, sku: 'SS-45W' },
    { name: 'Ốp lưng iPhone 16 Pro Max', price: 390000, sku: 'CASE-IP16PM' },
    { name: 'Ốp lưng Samsung S25 Ultra', price: 350000, sku: 'CASE-S25U' },
    { name: 'Cáp USB-C to Lightning', price: 290000, sku: 'CABLE-CL' },
    { name: 'Cáp USB-C to USB-C 2m', price: 190000, sku: 'CABLE-CC-2M' },
  ];

  const watchProducts = [
    { name: 'Apple Watch Series 10 42mm', price: 11990000, sku: 'AW-S10-42' },
    { name: 'Apple Watch Series 10 46mm', price: 12990000, sku: 'AW-S10-46' },
    { name: 'Apple Watch SE 2024', price: 6990000, sku: 'AW-SE24' },
    { name: 'Samsung Galaxy Watch 7', price: 7490000, sku: 'SS-GW7' },
    { name: 'Samsung Galaxy Watch Ultra', price: 14990000, sku: 'SS-GWU' },
    { name: 'Garmin Venu 3', price: 11490000, sku: 'GAR-V3' },
    { name: 'Garmin Forerunner 265', price: 10990000, sku: 'GAR-FR265' },
    { name: 'Xiaomi Watch 2 Pro', price: 5990000, sku: 'XM-W2P' },
    { name: 'Huawei Watch GT 5 Pro', price: 8990000, sku: 'HW-GT5P' },
    { name: 'Amazfit T-Rex Ultra', price: 9990000, sku: 'AMZ-TRU' },
  ];

  const allProducts = [
    ...phoneProducts.map((p) => ({ ...p, categoryId: categories[0].id })),
    ...laptopProducts.map((p) => ({ ...p, categoryId: categories[1].id })),
    ...tabletProducts.map((p) => ({ ...p, categoryId: categories[2].id })),
    ...accessoryProducts.map((p) => ({ ...p, categoryId: categories[3].id })),
    ...watchProducts.map((p) => ({ ...p, categoryId: categories[4].id })),
  ];

  const products = await productRepo.save(
    allProducts.map((p) => productRepo.create(p)),
  );
  console.log(`📦 Created ${products.length} products`);

  console.log('✅ Seed completed!');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
