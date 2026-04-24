import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import './style.css'
import ui_image from '../../../../svgs/add-circle-svgrepo-com (3).svg'
import colors from '../../../../json/color.json'

const colorOptions = colors.map(({ name, code }) => ({
  value: name.toLowerCase(),
  label: name,
  color: code,
}))

const SIZE_TYPE_OPTIONS = [
  {
    key: 'shoes',
    label: 'Shoe sizes',
    options: Array.from({ length: 25 }, (_, index) => String(index + 36)),
  },
  {
    key: 'clothing',
    label: 'Clothing sizes',
    options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  },
  {
    key: 'food',
    label: 'Food sizes',
    options: ['Small', 'Medium', 'Large'],
  },
  {
    key: 'default',
    label: 'General sizes',
    options: ['One Size', 'Small', 'Medium', 'Large', 'Extra Large'],
  },
]

const CLOTHING_SUBTYPE_OPTIONS = [
  {
    key: 'trousers',
    label: 'Trousers',
    options: Array.from({ length: 23 }, (_, index) => String(index + 28)),
  },
  {
    key: 'shorts',
    label: 'Shorts',
    options: Array.from({ length: 23 }, (_, index) => String(index + 28)),
  },
  {
    key: 'shirt',
    label: 'Shirt',
    options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  },
  {
    key: 'gown',
    label: 'Gown',
    options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  },
  {
    key: 'skirt',
    label: 'Skirt',
    options: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  },
]

const MATERIAL_OPTIONS = {
  clothing: [
    'Cotton',
    'Polyester',
    'Wool',
    'Linen',
    'Denim',
    'Silk',
  ],
  shoes: [
    'Leather',
    'Canvas',
    'Mesh',
    'Rubber',
    'Suede',
  ],
  food: [
    'Bottle',
    'Can',
    'Box',
    'Pack',
    'Plate',
  ],
  default: [
    'Cotton',
    'Polyester',
    'Leather',
    'Plastic',
    'Paper',
  ],
}

function formatOptionLabel({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: color,
          border: '1px solid #ccc',
        }}
      />
      {label}
    </div>
  )
}

const getSizeTypeConfig = (sizeTypeKey) =>
  SIZE_TYPE_OPTIONS.find((item) => item.key === sizeTypeKey) ??
  SIZE_TYPE_OPTIONS.find((item) => item.key === 'default')

const getClothingSubtypeConfig = (subTypeKey) =>
  CLOTHING_SUBTYPE_OPTIONS.find((item) => item.key === subTypeKey) ?? null

const resolveSizeOptions = ({ category = '', subCategory = '', type = '' }) => {
  const labels = [type, subCategory, category]
    .filter(Boolean)
    .map((value) => value.toLowerCase())

  const matches = (keywords) =>
    labels.some((label) => keywords.some((keyword) => label.includes(keyword)))

  if (
    matches([
      'shoe',
      'shoes',
      'sneaker',
      'sneakers',
      'boot',
      'boots',
      'sandal',
      'sandals',
      'slipper',
      'slippers',
      'foot wear',
      'footwear',
      'palms',
      'cotina',
    ])
  ) {
    return {
      key: 'shoes',
      label: 'Shoe sizes',
      options: getSizeTypeConfig('shoes').options,
    }
  }

  if (
    matches([
      'pizza',
      'shawarma',
      'sharwarma',
      'sharwama',
      'burger',
      'food',
      'meal',
      'snack',
      'snacks',
      'drink',
      'drinks',
      'beverage',
      'beverages',
    ])
  ) {
    return {
      key: 'food',
      label: 'Food sizes',
      options: getSizeTypeConfig('food').options,
    }
  }

  if (
    matches([
      'cloth',
      'clothing',
      'skirt',
      'gown',
      'dress',
      'top',
      'trouser',
      'trousees',
      'underwear',
      'sports-wear',
      'swim-suit',
      'shirt',
      't-shirt',
      'jacket',
      'hoodie',
    ])
  ) {
    return {
      key: 'clothing',
      label: 'Clothing sizes',
      options: getSizeTypeConfig('clothing').options,
    }
  }

  return {
    key: 'default',
    label: 'General sizes',
    options: getSizeTypeConfig('default').options,
  }
}

const resolveClothingSubType = ({ category = '', subCategory = '', type = '' }) => {
  const labels = [type, subCategory, category]
    .filter(Boolean)
    .map((value) => value.toLowerCase())

  const matches = (keywords) =>
    labels.some((label) => keywords.some((keyword) => label.includes(keyword)))

  if (matches(['trouser', 'trousees', 'pants'])) {
    return 'trousers'
  }

  if (matches(['short', 'shorts', 'nicker'])) {
    return 'shorts'
  }

  if (matches(['shirt', 't-shirt', 'top', 'hoodie', 'jacket'])) {
    return 'shirt'
  }

  if (matches(['gown', 'dress'])) {
    return 'gown'
  }

  if (matches(['skirt'])) {
    return 'skirt'
  }

  return ''
}

const toSelectOptions = (items) =>
  items.map((item) => ({
    value: item.toLowerCase(),
    label: item,
  }))

const priceFormatter = new Intl.NumberFormat('en-NG')

const formatPriceInput = (value) => {
  const normalizedValue = value.replace(/,/g, '').replace(/[^\d.]/g, '')

  if (!normalizedValue) {
    return ''
  }

  const [integerPart = '', decimalPart] = normalizedValue.split('.')
  const formattedInteger = integerPart
    ? priceFormatter.format(Number(integerPart))
    : '0'

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger
}

const createEmptyVariantState = () => ({
  color: null,
  size: null,
  material: null,
  price: '',
  stock: '',
})

const buildVariantSnapshot = (variantValues) => [
  variantValues.color?.label && { label: 'Color', value: variantValues.color.label },
  variantValues.size?.label && { label: 'Size', value: variantValues.size.label },
  variantValues.material?.label && {
    label: 'Material',
    value: variantValues.material.label,
  },
  variantValues.price && { label: 'Price', value: `₦${variantValues.price}` },
  variantValues.stock && { label: 'Stock', value: variantValues.stock },
].filter(Boolean)

export default function Variant({
  // updateVariantFloater,
  updateVariant,
  category = '',
  subCategory = '',
  type = '',
  /** Rows from parent (create + edit load); synced as-is */
  savedVariantsData,
}) {
  const sizeConfig = resolveSizeOptions({ category, subCategory, type })
  const clothingSubType = resolveClothingSubType({ category, subCategory, type })
  const clothingSubTypeConfig = getClothingSubtypeConfig(clothingSubType)
  const resolvedSizeOptions =
    sizeConfig.key === 'clothing' && clothingSubTypeConfig
      ? clothingSubTypeConfig.options
      : sizeConfig.options
  const materialOptions = toSelectOptions(
    MATERIAL_OPTIONS[sizeConfig.key] ?? MATERIAL_OPTIONS.default
  )
  const variantFields = [
    {
      key: 'color',
      label: 'Color',
      options: colorOptions,
      placeholder: 'Select a color',
      formatOptionLabel,
    },
    {
      key: 'size',
      label:
        sizeConfig.key === 'clothing' && clothingSubTypeConfig
          ? `${clothingSubTypeConfig.label} size`
          : sizeConfig.label.replace(/s$/i, ''),
      options: toSelectOptions(resolvedSizeOptions),
      placeholder:
        sizeConfig.key === 'clothing' && clothingSubTypeConfig
          ? `Select a ${clothingSubTypeConfig.label.toLowerCase()} size`
          : `Select ${sizeConfig.label.toLowerCase()}`,
    },
    {
      key: 'material',
      label: sizeConfig.key === 'food' ? 'Packaging' : 'Material',
      options: materialOptions,
      placeholder:
        sizeConfig.key === 'food' ? 'Select packaging' : 'Select a material',
    },
  ]

  const [selectedVariants, setSelectedVariants] = useState(createEmptyVariantState)
  const [savedVariants, setSavedVariants] = useState([]);
  const [variantError, setVariantError] = useState('')
  const lastIncomingVariantsJson = useRef(null)

  useEffect(() => {
    if (savedVariantsData === undefined) return
    const rows = Array.isArray(savedVariantsData) ? savedVariantsData : []
    const serialized = JSON.stringify(rows)
    if (lastIncomingVariantsJson.current === serialized) return
    lastIncomingVariantsJson.current = serialized
    setSavedVariants(
      rows.map((row, index) => ({
        ...row,
        id:
          row?.id != null && String(row.id) !== ''
            ? row.id
            : `variant-${index}`,
        stock: Number(row?.stock ?? 0),
        details: Array.isArray(row?.details) ? row.details : [],
      }))
    )
  }, [savedVariantsData])

  useEffect(() => {
    updateVariant(savedVariants);
  }, [savedVariants, updateVariant]);

  const handleVariantChange = (field, value) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePriceChange = (event) => {
    setSelectedVariants((prev) => ({
      ...prev,
      price: formatPriceInput(event.target.value),
    }))
    setVariantError('')
  }

  const handleStockChange = (event) => {
    const value = event.target.value.replace(/,/g, '')

    if (value === '' || /^\d+$/.test(value)) {
      setSelectedVariants((prev) => ({
        ...prev,
        stock: value,
      }))
      setVariantError('')
    }
  }

  const handleResetVariants = () => {
    setSelectedVariants(createEmptyVariantState())
    setVariantError('')
  }

  const hasVariantDetails = Object.values(selectedVariants).some((value) => {
    if (typeof value === 'string') {
      return value.trim() !== ''
    }

    return value !== null
  })

  const handleSaveVariant = () => {
    if (!hasVariantDetails) {
      return
    }

    if (!selectedVariants.stock || Number(selectedVariants.stock) <= 0) {
      setVariantError('Enter a stock quantity greater than 0.')
      return
    }

    const snapshot = buildVariantSnapshot(selectedVariants)

    setSavedVariants((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        details: snapshot,
        stock: Number(selectedVariants.stock),
      },
    ])
    setSelectedVariants(createEmptyVariantState())
    setVariantError('')
  }

  const handleDeleteVariant = (variantId) => {
    setSavedVariants((prev) => prev.filter((item) => item.id !== variantId))
  }

  return (
    <div className="product-variant">
      <h6 style={{ color: '#727272' }}>Options (Variant)</h6>
      <hr />

      <button
        className="variant-btn"
        // onClick={() => updateVariantFloater(true)}
        style={{
          color: '#727272',
          background: '#fff',
          padding: '5px',
          height: 'auto',
          fontSize: 'small',
          borderRadius: '5px',
        }}
      >
        <span>
          <img
            src={ui_image.src}
            style={{ height: '20px', width: '20px', borderRadius: '10px' }}
            alt=""
          />
        </span>
        &nbsp;
        &nbsp;
        <span>Add options like color or size.</span>
      </button>

      <div className="product-variant-cnt">
        {variantFields.map(
          ({ key, label, options, placeholder, formatOptionLabel: optionFormatter }) => (
            <div className="input-cnt" key={key}>
              <label htmlFor="">{label}</label>
              <Select
                options={options}
                value={selectedVariants[key]}
                onChange={(value) => handleVariantChange(key, value)}
                formatOptionLabel={optionFormatter}
                placeholder={placeholder}
              />
            </div>
          )
        )}
        <div className="input-cnt">
          <label htmlFor="variant-stock">Stock</label>
          <input
            id="variant-stock"
            type="text"
            style={{
              width: '100%',
              border: '1px solid rgb(202, 202, 202)',
              padding: '12px 10px',
              background: 'transparent',
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter variant stock"
            value={selectedVariants.stock}
            onChange={handleStockChange}
          />
        </div>

        <div className="input-cnt">
          <label htmlFor="variant-price">Price</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              border: '1px solid #d0d5dd',
              borderRadius: '6px',
              padding: '0 12px',
              background: '#fff',
            }}
          >
            <span style={{ color: '#667085', fontWeight: 600 }}>₦</span>
            <input
              id="variant-price"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Enter variant price"
              value={selectedVariants.price}
              onChange={handlePriceChange}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '12px 0',
                background: 'transparent',
              }}
            />
          </div>
        </div>
       


        <div className="err-mssg">{variantError || ""}</div>

        <div className="variant-actions">
          <button
            type="button"
            className="variant-action-btn variant-action-btn-primary"
            disabled={!hasVariantDetails}
            onClick={handleSaveVariant}
          >
            Add variant
          </button>
          <button
            type="button"
            className="variant-action-btn variant-action-btn-secondary"
            onClick={handleResetVariants}
          >
            Clear fields
          </button>
        </div>

        {savedVariants.length > 0 && (
          <div className="saved-variants">
            {savedVariants.map((variant, index) => (
              <div className="saved-variant-card" key={variant.id}>
                <div className="saved-variant-card-top">
                  <h6>Variant {index + 1}</h6>
                  <button
                    type="button"
                    className="saved-variant-delete-btn"
                    onClick={() => handleDeleteVariant(variant.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="saved-variant-details">
                  {variant.details.map((detail) => (
                    <div className="saved-variant-detail" key={`${variant.id}-${detail.label}`}>
                      <span className="saved-variant-label">{detail.label}</span>
                      <span className="saved-variant-value">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}