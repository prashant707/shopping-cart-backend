//library imports
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

//models imports
const Product = require("./models/product.model");
const Category = require("./models/category.model");
const Cart = require("./models/cart.model");
const {Address} = require("./models/address.model");
const Order = require("./models/order.model");
const UserEcom = require("./models/user.model");
const Wishlist = require("./models/wishlist.model");

//importing db connection function
const { initialiseDatabaseConnection } = require("./db/db.connect");




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
        console.log("An error occurred while creating data.",error);
    }
}

async function getProducts(query) {
    try{
        
        if(query.category){
        const categories = await Category.find({name:{$in:query.category}});
        const categoryIds = categories.map(category=>category._id)
        query.category = {$in:categoryIds};
        }
        
        const allProducts = await Product.find(query).populate('category');
        console.log("products length>>>>",allProducts);
        console.log("products length>>>>",allProducts.length)
        console.log("query>>>>",query);
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

app.get('/api/products', async (req,res)=>{
    
    try{
        const {minPrice,maxPrice,sortBy,selectedCategory,search,rating} = req.query;
        let query = {};
        
        if(minPrice || maxPrice){
            query.price = {};
            if(minPrice){
                query.price.$gte = parseFloat(minPrice);
            
            }
            
            if(maxPrice){
                query.price.$lte = parseFloat(maxPrice);
            }
        }

        if(selectedCategory){
            query.category = selectedCategory;
        }

        if(rating){
            query.rating = {};
            query.rating.$gte = parseFloat(rating);
        }

        console.log("category>>>",query)

        if (search) {
         query.name = { $regex: search, $options: "i" };
       }

        
        const products = await getProducts(query);

        
        if(products.length > 0){
            if(sortBy=='lowToHigh'){
                products.sort((a,b) => a.price - b.price);
            }else if(sortBy=='highToLow'){
                products.sort((a,b)=>b.price - a.price);
            }
            res.status(200).json({data:{products}})
        }else{
            res.status(404).json({error:"No product found."})
        }

        console.log("queryy>>",query)
    }catch(error){
        res.status(500).json({message:"An error occurred while fetching data.",error});
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
            res.status(200).json({data:{    }})
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
        // console.log(categoryData);
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

async function getCartDatabyUserId(userId) {
    try{
        const cartData = await Cart.find({userId:userId}).populate("product");
        return cartData;
    }catch(error){
        console.log("An error occurred while fetching data >> ",error);
    }
}

async function createCartData(cartData) {
    const {userId,productId,action="increase"} = cartData;
    
    console.log("cart data>>",cartData);

    try{
        let cartItem = await Cart.findOne({userId,product:productId}).populate("product");
        console.log("cartItem>>>",cartItem)
        if(cartItem){
            if(action==="increase"){
                if(cartItem.quantity < cartItem.product.quantityAvailable){
                    cartItem.quantity += 1;
                    const updatedCartItem = await cartItem.save();
                    console.log("Updated>>>",updatedCartItem)
                    return {item:updatedCartItem,isDelete:false,message:""};;
                } else{
                    return {item:cartItem,isDelete:false,message:"maximum quantity reached."};;
                }
                
            }else if(action==="decrease"){

                console.log("inside else decrease>>>")
                cartItem.quantity -= 1;
                if(cartItem.quantity<=0){
                    const deletedItem = await deleteCartItem(cartData);
                    return {item:deletedItem,isDelete:true,message:""};
                }
                const updatedCartItem = await cartItem.save();
                return {item:updatedCartItem,isDelete:false,message:""};
            }
            
        }
        else{
            console.log("inside else")
             cartItem = new Cart({userId,product:productId});
             const newCartItem = await cartItem.save();
             const populatedCartItem = await Cart.findById(newCartItem._id).populate("product");
             return {item:populatedCartItem,isDelete:false,message:""};
        }
       

    }catch(error){
        console.log("An error occurred while creating data.", error);
    }
}

async function deleteCartItem(cartData) {
    const {userId,productId} = cartData;
    try{
        const deletedCartItem = await Cart.findOneAndDelete({userId,product:productId});
        // console.log("deleted cart item>>",deletedCartItem)
        return deletedCartItem;
    }catch(error){
            console.log("An error occurred whhile deleting cart data.",error);
    }
}

app.get("/api/cart/:userId",async (req,res)=>{
    const userId = req.params.userId;
    try{
        const cartData = await getCartDatabyUserId(userId);
        if(cartData.length>0){
            res.status(200).json({message:"Cart Data fetched Successfully",data:{cart:cartData}})
        }
        else{
            res.status(200).json({message:"No data found.",data:{cart:[]}})
        }
    }catch(error){
            res.status(500).json({error:"An error occurred while fetching data."});
    }
})

app.post("/api/cart/add",async (req,res)=>{
    const cartData = req.body;
    try{
        if(cartData.userId && cartData.productId){
            const {item,isDelete,message} = await createCartData(cartData);
            // console.log("cart item>>>>",cartItem)
            if(isDelete){
                res.status(200).json({message:'Product removed from cart.',item});
            }else if(item && message==""){
                res.status(200).json({message:'Cart updated Successfully.',item});
            }else if(message==="maximum quantity reached."){
                 res.status(200).json({message:'Maximum quantity reached.',item});
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

async function getWishlistDataByUserId(userId){
    try{

        const wishlistData = await Wishlist.find({userId:userId}).populate("productIds");
        console.log("wishlistData>>",JSON.stringify(wishlistData));
        return wishlistData;

    }catch(error){
        console.log("An error occurred",error);
    }
}
// getWishlistDataByUserId("67ee246df24c44d71f285bb6");

async function addItemWishlistData(wishlistData) {
    const {userId,productId} = wishlistData;
    try{
        console.log(userId)
         const prodInWishlist = await Wishlist.findOne({userId,productIds:{$in:[productId]}}).populate("productIds");
         console.log("prodInWishlist>>>",prodInWishlist)
         if(prodInWishlist){
            return prodInWishlist;
         }else{
            const updatedWishlist = await Wishlist.findOneAndUpdate({userId},{$addToSet:{productIds:productId}},{new:true,upsert:true}).populate("productIds");
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

app.get("/api/wishlist/:userId", async (req,res)=>{
    const userId = req.params.userId;
    try{
        const wishlistData =  await getWishlistDataByUserId(userId);
        if(wishlistData){
            res.status(200).json({message:"data fetched successfully",data:wishlistData[0]})
        }else{
            res.status(200).json({error:"no data found",data:{}})
        }
        
    }catch(error){
        res.status(500).json({error:`An error occured while fetching data ${error}`});
    }
})
app.post("/api/wishlist/add", async (req,res)=>{
    const wishlistData = req.body;
    try{
      const wishlist = await addItemWishlistData(wishlistData); 
      if(wishlist){
        res.status(201).json({message:'Product Added to wishlist',data:{wishlist:wishlist}})
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
        res.status(201).json({message:'Product Removed from wishlist'})
      }else{
        res.status(404).json({error:"Item not found."});
      }
      
    }catch(error){
        res.status(500).json({error:'An error occurred while deleting product from wishlist'})
    }
})


//order

async function getOrders(userId){
    try{
        const orders = await Order.find({userId});
        return orders;
    }catch(error){
        console.log(`function : getOrder , An error occured>> ${error}`);
    }
}


async function createOrder(orderBody){
const {userId,addressId,cart} = orderBody;
try{
    const address = await Address.findById(addressId);
    if(cart.length > 0){
        let totalAmount = 0;
        let totalAmountWithDiscount=0
        let totalDiscount = 0;
        const orderItems = [];
        for(const cartItem of cart){
            const {product,quantity} = cartItem;
            console.log("Product>>>",product);
            const productDb = await Product.findById(product);
           console.log("single product >>",product);
            console.log("ProductDb>>>",productDb);
        if(!productDb || productDb.quantityAvailable < quantity ){
            return { error: `Product ${productDb.name} is unavailable or out of stock` };
        }
         totalAmount += productDb.price*quantity;
         totalDiscount += productDb.price*(productDb.discount/100)*quantity;
         orderItems.push({
            product: productDb._id,
            quantity:quantity,
            price:productDb.price
         });
        totalAmountWithDiscount = totalAmount-totalDiscount; 
        productDb.quantityAvailable -= quantity;
        await productDb.save();
        }

        const newOrder = new Order({
            userId,
            items:orderItems,
            totalAmount:totalAmount,
            totalAmountWithDiscount:totalAmountWithDiscount,
            shippingAddress:address

        });

       const orderCreated = newOrder.save();
       return orderCreated;


        
    }

    

}catch(error){
    console.log("An error occurred while creating order.",error);
}

}

app.get('/api/profile/order/:userId',async (req,res)=>{
    try{
        const userId = req.params.userId;
        const orders = await getOrders(userId);
        if(orders?.length>0){
            res.status(200).json({message:'Orders fetched successfully',data:{orders}})
        }else{
            res.status(404).json({message:'No orders fetched',data:{orders:[]}});
        }
    }catch(error){
        res.status(500).json("An error occurred >>",error);
    }
})

app.post('/api/profile/order/create',async (req,res)=>{
    const orderBody = req.body;
    try{
        const orderCreated = await createOrder(orderBody);
        if(orderCreated){
            res.status(201).json({message:'Order created successfully.',data:{order:orderCreated}});
        }
    }catch(error){
            res.status(500).json({error:`An error occurred while creating order.${error}`});
    }
})

//address

async function createAddress(addressBody){
    try{

        const address = new Address(addressBody);
        const createdAddress = address.save();
         return createdAddress;

        }catch(error){
            console.log("An error occurred while creating address.")
        }
}

async function getAddress(userId){
    try{
        const addresses = await Address.find({userId});
        return addresses;
    }catch(error){
        console.log("An error occurred.")
    }
}

async function deleteAddressById(addressId){
    try{
        const deletedAddress = await Address.findByIdAndDelete(addressId);
        return deletedAddress;
    }catch(error){
        console.log({error:'An error occurred'})
    }
}

app.get("/api/profile/address/:userId", async(req,res)=>{
    const userId = req.params.userId;
    try{
        const addresses = await getAddress(userId);
        if(addresses?.length>0){
            res.status(200).json({message:"Address found succesfully.",data:{addresses}})
        }else{
             res.status(200).json({message:"No address found.",data:{addresses:[]}})
        }
        
    }catch(error){
        res.status(500).json({error:`An error occurred at the server end. ${error}`})
    }
})


app.post("/api/profile/address/add", async(req,res)=>{
    const addressBody = req.body;
    try{
        if(addressBody.userId && addressBody.fullName  ){
            const addressCreated = await createAddress(addressBody);
            if(addressCreated){
                res.status(201).json({message:'Address created',data:{address:addressCreated}});
            }
            
        }else{
            res.status(400).json({error:"Bad request."})
        }
        
    }catch(error){
        res.status(500).json({error:`An error occurred at the server end. ${error}`})
    }
})

app.delete("/api/profile/address/:addressId",async (req,res)=>{
    try{
        const addressId = req.params.addressId;
        if (!addressId) {
            return res.status(400).json({ message: 'Address ID is required.' });
        }
        const deletedAddress = await deleteAddressById(addressId);
        if(deletedAddress){
            res.status(200).json({message:'Address deleted successfully.'});
        }else{
            res.status(404).json({message:'Address not found.'});
        }

    }catch(error){
        res.status(500).json({error:"An error occurredd."});
    }
})

//reading JSON file

// const fs = require('fs');
// const productData =fs.readFileSync("./Dataset/Product.json",'utf-8');
// const jsonObj = JSON.parse(productData);
// const categoryData = fs.readFileSync("./Dataset/Category.json",'utf-8')
// const categoryDataParsed = JSON.parse(categoryData);
// console.log(categoryDataParsed);

// Utility Script for loading data

// function createCategoryDataScript(){
// for(let i=0;i<categoryDataParsed.length;i++){
//     createCategoryData(categoryDataParsed[i]);
// }
// }

// createCategoryDataScript();

// function createProductScript(){
// for(let i=0;i<jsonObj.length;i++){
//     createProductData(jsonObj[i]);
// }
// }

// createProductScript()

// async function deleteAllProduct(){
//     const deletedProd = await Product.deleteMany();
// }
// deleteAllProduct();




app.listen(PORT, ()=>{
    console.log(`Server running on PORT ${PORT}`);
})