import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCategories } from "../api/categories";
import { createProduct, fetchProduct, updateProduct } from "../api/products";

const ProductForm: React.FC = () => {
    const { id, productId } = useParams();
    const isEdit = !!productId; // Определяем режим (создание или редактирование)
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    if (!id) return null; // Если нет shopId, ничего не делаем

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        ingredients: "",
        categoryId: "",
        image: null as File | null,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = "Название обязательно.";
        if (!formData.price) newErrors.price = "Цена обязательна.";
        if (!formData.categoryId)
            newErrors.categoryId = "Категория обязательна.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Загружаем продукт только в режиме редактирования
    useQuery(
        ["product", id, productId],
        () => fetchProduct(Number(id), Number(productId)),
        {
            enabled: isEdit, // Запрос активен только в режиме редактирования
            onSuccess: (data) => {
                setFormData({
                    name: data.name,
                    description: data.description || "",
                    price: parseFloat(data.price),
                    ingredients: data.ingredients || "",
                    categoryId: data.categoryId
                        ? data.categoryId.toString()
                        : "",
                    image: null,
                });
            },
        }
    );

    // Загружаем категории
    const { data: categories, isLoading: isLoadingCategories } = useQuery(
        "categories",
        fetchCategories
    );

    const createMutation = useMutation(
        ({ shopId, formData }: { shopId: number; formData: FormData }) =>
            createProduct({ shopId, formData }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["products", id]);
                navigate(`/shops/${id}`);
            },
        }
    );

    const updateMutation = useMutation(
        ({
            shopId,
            productId,
            formData,
        }: {
            shopId: number;
            productId: number;
            formData: FormData;
        }) => updateProduct({ shopId, productId, formData }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["products", id]);
                navigate(`/shops/${id}`);
            },
        }
    );

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | React.ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const { name, value, files } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: files
                ? files[0]
                : name === "price"
                ? parseFloat(value)
                : value,
        }));
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description || "");
        data.append("price", formData.price.toString());
        data.append("category_id", formData.categoryId);
        data.append("ingredients", formData.ingredients || "");
        if (formData.image) {
            data.append("image", formData.image);
        }

        if (isEdit) {
            updateMutation.mutate({
                shopId: Number(id),
                productId: Number(productId),
                formData: data,
            });
        } else {
            createMutation.mutate({
                shopId: Number(id),
                formData: data,
            });
        }
    };

    if (isEdit && !categories) return <Typography>Загрузка...</Typography>;
    if (isLoadingCategories)
        return <Typography>Загрузка категорий...</Typography>;

    return (
        <Box p={3} maxWidth="600px" mx="auto">
            <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Назад
            </Button>
            <Typography variant="h4" mb={3}>
                {isEdit ? "Редактировать букет" : "Создать букет"}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                    label="Название"
                    name="name"
                    variant="outlined"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                />
                <TextField
                    label="Описание"
                    name="description"
                    variant="outlined"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.description}
                    onChange={handleChange}
                />
                <TextField
                    label="Цена"
                    name="price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={formData.price}
                    onChange={handleChange}
                    required
                    error={!!errors.price}
                    helperText={errors.price}
                />
                <TextField
                    label="Состав"
                    name="ingredients"
                    variant="outlined"
                    fullWidth
                    value={formData.ingredients}
                    onChange={handleChange}
                />
                <FormControl fullWidth>
                    <InputLabel id="category-label">Категория</InputLabel>
                    <Select
                        labelId="category-label"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        error={!!errors.categoryId}
                    >
                        {categories.map((category: any) => (
                            <MenuItem
                                key={category.id}
                                value={category.id.toString()}
                            >
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.categoryId && (
                        <Typography color="error">
                            {errors.categoryId}
                        </Typography>
                    )}
                </FormControl>
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    fullWidth
                >
                    Загрузить изображение
                    <input
                        type="file"
                        name="image"
                        hidden
                        accept="image/*"
                        onChange={handleChange}
                    />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={
                        !formData.name ||
                        !formData.price ||
                        !formData.categoryId
                    }
                >
                    {isEdit ? "Сохранить изменения" : "Создать"}
                </Button>
            </Box>
        </Box>
    );
};

export default ProductForm;
