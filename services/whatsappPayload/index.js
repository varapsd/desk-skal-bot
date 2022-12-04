

const axios = require("axios");
require("dotenv").config();

var whatsappPayload = {}

const getAllCategories = async (companyId, page) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"category/getActiveCategories?page="+page+"&limit=9",
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

const getProductsByCategory = async (companyId, id, page) => {
    try {
        const { data } = await axios.get(
            process.env.BACKEND_URL+"product/getActiveProductsIncategory?category_id="+id+"&page="+page+"&limit=9",
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        return data;
    } catch (error) {
        throw error;
    }
}

whatsappPayload.getCategoriesPaload = async (companyId, templateId, page) => {
    try {
        page = Number(page);
        nextPage = page + 1;
        const categoriesData = await getAllCategories(companyId, page);
        const categories = categoriesData.rows;

        const rows = categories.map(category => {
            return {
                "id": templateId + "-" + category.id,
                "title": category.category_name,
                "description": category.category_name + " description"
            }
        })
        if(categoriesData.isMoreRequired){
            rows.push(
                {
                    "id": templateId +"-More-" + nextPage,
                    "title": "More Categories",
                }
            )
        }
        return rows;
    } catch (error) {
        throw error;
    }
}

whatsappPayload.getProductsPayload = async (companyId, templateId, categoryId, page) => {
    try {
        page = Number(page);
        nextPage = page + 1;
        const productsData = await getProductsByCategory(companyId, categoryId, page);
        const products = productsData.rows;

        const rows = products.map(product => {
            return {
                "id": templateId+"-"+categoryId+"-" + product.id,
                "title": product.product_name,
                "description": product.id + " " + product.product_name + " description"
            }
        })

        if(productsData.isMoreRequired){
            rows.push(
                {
                    "id": templateId +"-"+ categoryId + "-More-" + nextPage,
                    "title": "More Categories",
                }
            )
        }
        return rows;
    } catch (error) {
        
    }
}

module.exports = whatsappPayload;