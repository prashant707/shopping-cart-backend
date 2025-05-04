const mongoose = require("mongoose");
const Product = require("./models/product.model");
const Category = require("./models/category.model");
const Cart = require("./models/cart.model")
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { initialiseDatabaseConnection } = require("./db/db.connect");

const fs = require('fs');
const UserEcom = require("./models/user.model");
const { error } = require("console");
const Wishlist = require("./models/wishlist.model");
const productData =fs.readFileSync("./Dataset/Product.json",'utf-8');
const jsonObj = JSON.parse(productData);


const categoryData = fs.readFileSync("./Dataset/Category.json",'utf-8')
const categoryDataParsed = JSON.parse(categoryData);
console.log(categoryDataParsed);

app.use(express.json());
app.use(cors());

initialiseDatabaseConnection();


const PORT = process.env.PORT;
const API_URL = process.env.API_URL;

// User

async function createUser(userData) {
    try{
        const createdUser = new UserEcom(userData);
        const user = await createdUser.save();
        return user;
    }catch(error){
        console.log("An error occuredd >>",error);
    }
}


app.post("/api/users",async (req,res)=>{
    try{

        const userData = req.body;
        if(userData.name && userData.email ){
            const user = await createUser(userData);
            if(user){
                    res.status(201).json({message:'user created successfully'});
            }
        }else{
            res.status(400).json({error:'please provide requied field value name and email.'});
        }
        
        
    }catch(error){
        res.status(500).json({message:"An error occurred while creating user."})
    }

})


// Products

async function createProductData(data){
    try{
        const createProduct = new Product(data);
        const product = await createProduct.save();
        return product;
        
    }catch(error){
        console.log("An error occurred while creating data.");
    }
}

async function getProducts() {
    try{
        const allProducts = await Product.find().populate('category');
        console.log(allProducts)
        return allProducts;
    }catch(error){
        console.log("An error occurred while creating data.",error);
    }
}

async function getProductById(productId) {
    try{
        const product = await Product.findById(productId).populate('category');
        console.log(product)
        return product;
    }catch(error){
        console.log("An error occurred while creating data.",error);
    }
}

async function  getProductByCategoryId(categoryId) {
    try{
        const productsByCategory = await Product.find({category:categoryId}).populate('category');
        console.log(productsByCategory)
        return productsByCategory;
    }catch(error){
        console.log("An error occurred while creating data.",error);
    }
}

app.get('/shoppingcart', async (req,res)=>{
    try{
        const products = await getProducts();
        
        if(products.length > 0){
            res.status(200).json({data:{products}})
        }else{
            res.status(404).json({error:"No product found."})
        }
    }catch(error){
        res.status(500).json({error:"An error occurred while fetching data."});
    }
})

app.get('/shoppingcart/products/:productId', async (req,res)=>{
    try{
        const productId = req.params.productId;
        const product = await getProductById(productId);
        
        if(product){
            res.status(200).json({data:{product}})
        }else{
            res.status(404).json({error:"No product found."})
        }
    }catch(error){
        res.status(500).json({error:"An error occurred while fetching data."});
    }
})

app.get('/shoppingcart/products/categories/:categoryId', async (req,res)=>{
    try{
        const categoryId = req.params.categoryId;
        const productsByCategory = await getProductByCategoryId(categoryId);
        
        if(productsByCategory.length > 0){
            res.status(200).json({data:{productsByCategory}})
        }else{
            res.status(404).json({error:"No product found."})
        }
    }catch(error){
        res.status(500).json({error:"An error occurred while fetching data."});
    }
})



app.post('/shoppingcart',async (req,res)=>{
try{
    const productData = req.body;
    
    if(!productData.name && !productData.description && !productData.category && !productData.price && !productData.quantityAvailable && !productData.size ){
       res.status(400).json({error:"Please provide required details name, description, category, price, quantity, size"})
    }else{
        const product  = await createProductData(productData);
        res.status(201).json(product)
    }

}catch(error){
    res.status(500).json("An error occured.");
}
})


// Category 

async function createCategoryData(data){
    try{
        const createCategory = new Category(data);
        const category = await createCategory.save();
        return category;
        
    }catch(error){
        console.log("An error occurred while creating data.");
    }
}

async function getCategoriesData() {
    try{
        const categoriesData = await Category.find();
        return categoriesData;
    }catch(error){
        console.log("An error occurred while fetching data .");
    }
}

async function getCategoriesDataById(catId) {
    try{
        const categoryData = await Category.findById(catId);
        console.log(categoryData);
        return categoryData;
    }catch(error){
        console.log("An error occurred while fetching data .");
    }
}

app.get("/shoppingcart/categories/",async(req,res)=>{
    try{
        const categoriesData = await getCategoriesData();
        if(categoriesData.length > 0){
            res.status(200).json({data:{categories:categoriesData}});
        }else{
            res.status(404).json({error:"No data found."});
        }
    }catch(error){
        res.status(500).json({error:`An error occurred while fetching record. ${error}`})
    }
});

app.get("/shoppingcart/categories/:categoryId",async(req,res)=>{
    try{
        const categoryId = req.params.categoryId;
        const categoryData = await getCategoriesDataById(categoryId);
        if(categoryData){
            res.status(200).json({data:{category:categoryData}});
        }else{
            res.status(404).json({error:"No data found."});
        }
    }catch(error){
        res.status(500).json({error:`An error occurred while fetching record. ${error}`})
    }
});


// Cart

async function createCartData(cartData) {
    const {userId,products,price} = cartData;
    

    try{
        let cartItem = await Cart.findOne({userId,products})
        console.log("cartItem>>>",cartItem)
        if(cartItem){
            cartItem.quantity += 1;
            const updatedCartItem = await cartItem.save();
            return updatedCartItem;
        }
        else{
             cartItem = new Cart(cartData);
             const newCartItem = await cartItem.save();
             return newCartItem;
        }
       

    }catch(error){
        console.log("An error occurred while creating data.", error);
    }
}

async function deleteCartItem(cartData) {
    const {userId,products} = cartData;
    try{
        const deletedCartItem = await Cart.findOneAndDelete({userId,products});
        console.log("deleted cart item>>",deletedCartItem)
        return deletedCartItem;
    }catch(error){
            console.log("An error occurred whhile deleting cart data.",error);
    }
}

app.post("/api/cart/add",async (req,res)=>{
    const cartItem = req.body;
    try{
        if(cartItem.userId && cartItem.products && cartItem.price){
            const cartItemAdded = await createCartData(cartItem);
            if(cartItemAdded){
                res.status(200).json({message:'Cart updated Successfully.',item:{cartItemAdded}});
            }
            
    } else{
            res.status(400).json({message:'Please provide required details.'});
    }
    }catch(error){
            res.status(500).json({message:`Error occurred while updating cart.${error}`});
    }
    
})

app.delete("/api/cart/delete", async (req,res)=>{
    try{
        const cartData = req.body;
        
        const deletedCartItem = await deleteCartItem(cartData);
        if(deletedCartItem){
            res.status(200).json({message:"Item deleted successfully."})
        }else{
            res.status(404).json({error:"Item not found."});
        }
    }catch(error){
        res.status(500).json({message:"An error occurred while deleting cart data."})
    }
})


// wishlist

async function addItemWishlistData(wishlistData) {
    const {userId,productId} = wishlistData;
    try{
        console.log(userId)
         const prodInWishlist = await Wishlist.findOne({userId,productIds:{$in:[productId]}});
         console.log("prodInWishlist>>>",prodInWishlist)
         if(prodInWishlist){
            return prodInWishlist;
         }else{
            const updatedWishlist = await Wishlist.findOneAndUpdate({userId},{$addToSet:{productIds:productId}},{new:true,upsert:true});
            console.log("productId>>",productId);
            console.log("UpdatedWishlist>>",updatedWishlist);
            return updatedWishlist;
         }

         
    }catch(error){
        console.log("An error occurred . ",error);
    }
    
}

async function deleteItemFromWishllist(wishlistData) {

    const {userId,productId} = wishlistData;
    try{
        const prodInWishlist = await Wishlist.findOne({userId,productIds:{$in:[productId]}});
        if(prodInWishlist){
            const deletedProdInWishlist = await Wishlist.findOneAndUpdate({userId},{$pull:{productIds:productId}},{new:true});
            return deletedProdInWishlist;
        }else{
            return prodInWishlist;
        }

    }catch(error){
        console.log(error);
    }
}
app.post("/api/wishlist/add", async (req,res)=>{
    const wishlistData = req.body;
    try{
      const wishlist = await addItemWishlistData(wishlistData); 
      if(wishlist){
        res.status(201).json({message:'Product Added to wishlist'})
      }

    }catch(error){
        res.status(500).json({error:'An error occurred while adding product to wishlist'})
    }
})

app.delete("/api/wishlist/delete", async (req,res)=>{
    const wishlistData = req.body;
    try{
      const wishlist = await deleteItemFromWishllist(wishlistData); 
      if(wishlist){
        res.status(201).json({message:'Product Added to wishlist'})
      }else{
        res.status(404).json({error:"Item not found."});
      }
      
    }catch(error){
        res.status(500).json({error:'An error occurred while deleting product from wishlist'})
    }
})




// Utility Script for loading data
function createCategoryDataScript(){
for(let i=0;i<categoryDataParsed.length;i++){
    createCategoryData(categoryDataParsed[i]);
}
}

function createProductScript(){
for(let i=0;i<jsonObj.length;i++){
    createProductData(jsonObj[i]);
}
}

// createProductScript()

async function deleteAllProduct(){
    const deletedProd = await Product.deleteMany();
}
// deleteAllProduct();




app.listen(PORT, ()=>{
    console.log(`Server running on PORT ${PORT}`);
})