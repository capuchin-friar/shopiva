"use client"
import React, { useEffect, useRef, useState } from 'react'

import Title from '../../../../components/entrepreneur/product/Title/Title'
import Image from '../../../../components/entrepreneur/product/ImgSample/Image'
import Description from '../../../../components/entrepreneur/product/Description/Description'
import Price from '../../../../components/entrepreneur/product/Price/Price'
import Attribute from '../../../../components/entrepreneur/product/Attributes/Attributes'
import Inventory from '../../../../components/entrepreneur/product/Inventory/Inventory'
import Shipping from '../../../../components/entrepreneur/product/Shipping/Shipping'
import Variant from '../../../../components/entrepreneur/product/Variant/Variant'
import axios from 'axios'
import './styles/xxl.css'
import categories_json from "../../../../json/mvp_category.json";
import CategoryFloater from '../../../../components/floaters.js/Category'

export default function CreateProduct() {

  const [type, setType] = useState("");
  const [gender, setGender] = useState("");

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const isMountedRef = useRef(true);

  const updateSubCategory = (data) => {
    setSubCategory(data)
  }
  const updateType = (data) => {
    setType(data)
  }

  // Load main categories on mount
  useEffect(() => {
    const loadedCategories = [];
    for(let x in categories_json){
      loadedCategories.push(x.split("_").join(" & "));
    }
    setCategories(loadedCategories); 
  }, []); 

  // Load sub-categories when category changes
  useEffect(() => {
    // isMountedRef.current = true;
    
    // Reset sub-categories and type when category changes
    setSubCategories([]);
    setTypeList([]);
    
    if (category !== "" && category !== "fashion") {
      let result;
      
      for(let x in categories_json){
        if(x === category.split(" & ").join("_")){
          result = categories_json[x];
          break;
        }
      }
      
      if (result && result.length > 0) {
        const loadedSubCategories = result.map(sub_category => 
          sub_category.split("_").join(" & ")
        );
        // if (isMountedRef.current) {
          setSubCategories(loadedSubCategories);
        // }
      }
    } else if(category === "fashion"){
      let x = category.split(" & ").join("_");
      let index;
      if(gender.toLowerCase() === 'male'){
        index = 0;
      }else if(gender.toLowerCase() === 'female'){
        index = 1;
      }else{
        index = 2;
      }
      if(categories_json[x] && categories_json[x][index]){
        const loadedType = Object.entries(categories_json[x][index]).map(([key, value]) => key);
        // if (isMountedRef.current) {
        setSubCategories(loadedType);
        // }
      }
    }
    
    // return () => {
    //   isMountedRef.current = false;
    // };
  }, [category, gender]);

  useEffect(() => {
    if (category === "fashion" && gender !== "" && subCategory !== "") {
      let x = category.split(" & ").join("_");
      let index;
      if(gender.toLowerCase() === 'male'){
        index = 0;
      }else if(gender.toLowerCase() === 'female'){
        index = 1;
      }else{
        index = 2;
      }


      if(categories_json[x] && categories_json[x][index] && categories_json[x][index][subCategory]){
        const typeListData = Object.entries(categories_json[x][index][subCategory]).map(([key, value]) => key);
        setTypeList(typeListData);
      }
    }
  }, [category, gender, subCategory])

  let [product_id, set_product_id] = useState('');
  let [shop_id, set_shop_id] = useState('');
  let [category_active, set_category_active] = useState(false)

  useEffect(() => {
    document.body.style.overflow='hidden'
  }, [])

  function upload_data(data) {
    axios.post('http://localhost:3456/', {
      name: data.name, 
      value: data.value, 
      product_id, 
      shop_id
    })
    .then((result) => {

    })
    .catch((err) => {
      console.log(err)
    })
  }
  

  function updateTitle(data) {
    
  }

  function updateDescription(data) {
    
  }

  function close_floater() {
    set_category_active(false)
  }

  

  return (
    <>
      {
        category_active
        ?
        <CategoryFloater close_floater={close_floater} />
        :
        ''
      }
      {/* <h6 style={{color: '#000'}}>Product Details</h6> */}
      <div className="product-cnt">

        {/* <h3>Add Products</h3> */}

        <section>

        
          <div className='product-details'>

            <Title updateTitle={updateTitle} />
            <Description updateDescription={updateDescription} />
            <Image />
            <div className="product-category">
              <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                <label htmlFor="">Category</label>
                <select name="" id="" style={{textTransform: 'capitalize'}} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select a category</option>
                  {
                    categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))
                  }
                </select>
                <div className="err-mssg"></div>
              </div>
              <br />

              {
                category === "fashion" &&
                <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                  <label htmlFor="">Gender</label>
                  <select name="" id="" style={{textTransform: 'capitalize'}} onChange={e => setGender(e.target.value)}>
                    <option value="">Select your gender</option>
                    {
                      ["male", "female", "unisex"].map((gender, index) => (
                        <option value={gender}>{gender}</option>
                      ))
                    }
                  </select>
                  <div className="err-mssg"></div>
                </div>
              }
            </div>

          </div>
          <br />

          {
            category !== ""&&
            <div className="product-attribute">
              <Attribute typeList={typeList} sub_categories={subCategories} category={category} updateSubCategory={updateSubCategory} updateType={updateType} />
            </div>
          }
          <br />

          <div className='product-variants'>
            <Variant />
          </div>
          <br />

          <div className='product-pricing'>
            <Price />
          </div>
          <br />

          <div className='product-inventory'>
            <Inventory />
          </div>
          <br />

          <div className='product-shipping'>
            <Shipping />
          </div>
          <br />

        </section>

        <section>

        <div className="product-publication">
            <h6 style={{color: '#727272'}}>Product Status</h6>

            {/* <br /> */}

            <div className="input-cnt"  style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}><small>Status</small></label>
              <select name="" id="" style={{padding: '5px', outline: 'none', color: '#727272'}}>
                  {/* <option value="">Active</option> */}
                  <option value="">Draft</option>
              </select>
              <div className="err-mssg"></div>
            </div>
            
          </div>

          <br />

          <div className="product-org-cnt">
            <h6 style={{color: '#727272'}}>Product organization</h6>
            {/* <br /> */}
            

            <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}>
                <small>Brand Name</small>
              </label>
              <input  style={{width: '100%', border: '1px solid #727272'}} type="text" name="" id="" />
            </div>

            <br />

            <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}>
                <small>Tag</small>
              </label>
              <input  style={{width: '100%', border: '1px solid #727272'}} type="text" name="" id="" />
            </div>

            {/* <br />

            <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}>
                <small>Vendor</small>
              </label>
              <input  style={{width: '100%', border: '1px solid #727272'}} type="text" name="" id="" />
            </div> */}

          </div>

          <br />

          <div className="product-publication" style={{height: "fit-content"}}>
            <h6 style={{color: '#727272', marginBottom: "20px"}}>Delivery Methods</h6>

            {/* <br /> */}

            <div className="input-cnt" style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', height: "fit-content", marginBottom: "20px"}}>
              <input style={{width: '15px', border: '1px solid #727272', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
              &nbsp;
              <label style={{margin: '-4px 0 0 0', height: 'fit-content', lineHeight: "20px", color: '#727272'}} htmlFor=""><small>Allow customers to pick up orders from your location</small></label>
            </div>

            <div className="input-cnt" style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', height: "fit-content"}}>
              <input style={{width: '15px', border: '1px solid #727272', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
              &nbsp;
              <label style={{margin: '-4px 0 0 0', height: 'fit-content', lineHeight: "20px", color: '#727272'}} htmlFor=""><small>Deliver orders to the customer's address</small></label>
            </div>

            {/* <br />

            <div className="input-cnt" style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
              <input style={{width: '15px', border: '1px solid #727272', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
              &nbsp;
              <label style={{margin: '-8px 0 0 0', height: '15px', color: '#727272'}} htmlFor=""><small>Point Of Sale</small></label>
            </div>
            <br />
            <small style={{color: '#727272', fontSize: 'small'}}>Point of Sale has not been set up. Finish the remaining steps to start selling in person.</small>

 */}

          </div>
        </section>

      </div>
    </>
  )
}
