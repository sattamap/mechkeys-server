const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cppr05o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("mechkeysDB");
    const productsCollection = database.collection("products");
    const cartsCollection = database.collection("carts");
    const ordersCollection = database.collection("orders");

    // Endpoint to add a product
    app.post('/api/products', async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.status(201).json(result);
      } catch (error) {
        console.error('Failed to add product:', error);
        res.status(500).json({ message: 'Failed to add product', error });
      }
    });


// Endpoint to get all products with search, filters, and sorting
app.get('/api/products', async (req, res) => {
  try {
    const { search, brand, minPrice, maxPrice, sort } = req.query;
    
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // case-insensitive search
    }
    
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    let sortOption = {};
    if (sort === 'priceLowToHigh') {
      sortOption.price = 1;
    } else if (sort === 'priceHighToLow') {
      sortOption.price = -1;
    }

    const products = await productsCollection.find(query).sort(sortOption).toArray();
    const productsWithStockStatus = products.map(product => ({
      ...product,
      stock: product.quantity > 0 ? 'In Stock' : 'Out of Stock'
    }));

    res.json(productsWithStockStatus);
  } catch (error) {
    console.error('Failed to get products:', error);
    res.status(500).json({ message: 'Failed to get products', error });
  }
});



    // Endpoint to get a product by ID
    app.get('/api/product/:id', async (req, res) => {
      try {
        const productId = req.params.id;
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
        if (product) {
          res.json(product);
        } else {
          res.status(404).json({ message: 'Product not found' });
        }
      } catch (error) {
        console.error('Failed to get product:', error);
        res.status(500).json({ message: 'Failed to get product', error });
      }
    });

    // Endpoint to add to cart
    app.post('/api/carts', async (req, res) => {
      try {
        const { productId, quantity } = req.body;
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
          res.status(404).json({ message: 'Product not found' });
          return;
        }

        if (product.quantity < quantity) {
          res.status(400).json({ message: 'Not enough stock available' });
          return;
        }

        const existingCartItem = await cartsCollection.findOne({ productId });

        if (existingCartItem) {
          const updatedQuantity = existingCartItem.quantity + quantity;
          if (updatedQuantity > product.quantity) {
            res.status(400).json({ message: 'Not enough stock available' });
            return;
          }
          await cartsCollection.updateOne(
            { productId },
            { $set: { quantity: updatedQuantity } }
          );
        } else {
          await cartsCollection.insertOne({ productId, quantity });
        }

        res.status(200).json({ message: 'Product added to cart' });
      } catch (error) {
        console.error('Failed to add to cart:', error);
        res.status(500).json({ message: 'Failed to add to cart', error });
      }
    });

    app.get('/api/carts', async (req, res) => {
      try {
        const cartItems = await cartsCollection.aggregate([
          {
            $addFields: {
              productIdObjectId: { $toObjectId: "$productId" }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'productIdObjectId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              _id: 1,
              productId: 1,
              quantity: 1,
              product: {
                _id: 1,
                name: 1,
                price: 1,
                description: 1,
                quantity: 1,
                rating: 1,
                brand: 1,
                image: 1,
              }
            }
          }
        ]).toArray();
    
        res.json(cartItems);
      } catch (error) {
        console.error('Failed to get cart items:', error);
        res.status(500).json({ message: 'Failed to get cart items', error });
      }
    });



   // Update item quantity
app.patch('/api/carts/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    console.log(`Received request to update cart item. Product ID: ${productId}, Quantity: ${quantity}`);

    // Validate the quantity
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ error: 'Product not found' });
    }
    if (quantity > product.quantity) {
      console.log('Quantity exceeds available stock');
      return res.status(400).json({ error: 'Quantity exceeds available stock' });
    }

    // Update the cart item
    const cartItem = await cartsCollection.findOneAndUpdate(
      { productId: productId },
      { $set: { quantity } },
      { returnOriginal: false }
    );
    if (!cartItem) {
      console.log('Cart item not found');
      return res.status(404).json({ error: 'Cart item not found' });
    }

    console.log('Cart item updated successfully', cartItem);
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

    
    
// Remove item from cart
app.delete('/api/carts/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await cartsCollection.deleteOne({ productId });

    if (result.deletedCount === 1) {
      res.json({ productId });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove cart item', error });
  }
});


// Endpoint to place an order
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, phone, address, paymentMethod, totalPrice } = req.body;

    // Example validation
    if (!name || !email || !phone || !address || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Simulate saving to database
    const order = {
      name,
      email,
      phone,
      address,
      paymentMethod,
      totalPrice,
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);
    res.status(201).json(result.ops[0]); // Return the inserted document

  } catch (error) {
    console.error('Failed to place order:', error);
    res.status(500).json({ message: 'Failed to place order', error });
  }
});

    


    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);
