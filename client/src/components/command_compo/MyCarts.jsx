// Fichier CartPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkout from './Checkout';
import { AuthContext } from '../../context/authContext'; // importer AuthContext
import theme from '../../ui/theme'; // Ajoutez cette ligne

const CartPage = () => {
  const { orderId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  const { authToken } = useContext(AuthContext); // obtenir le token à partir du contexte

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api_v1/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setCartItems(res.data.data.cart.products);
      setCartId(res.data.data.cart._id);
      setTotalCost(res.data.data.cart.totalCost);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();

    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const res = await axios.get(
            `http://127.0.0.1:8000/api_v1/cart/${orderId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          setOrderDetails(res.data.data.order);
        } catch (err) {
          console.error(err);
        }
      };

      fetchOrderDetails();
    }
  }, [orderId, authToken]); // inclure le token comme dépendance

  const deleteItem = async (productId) => {
    try {
      const productToDelete = cartItems.find(
        (item) => item.product._id === productId
      );

      if (productToDelete) {
        const costToRemove =
          productToDelete.product.pricePerKg * productToDelete.quantity;

        await axios.delete(`http://127.0.0.1:8000/api_v1/cart/${productId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Utiliser le token à partir du contexte
          },
        });

        // Update the local state as well
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product._id !== productId)
        );

        // Update total cost
        setTotalCost((prevCost) => prevCost - costToRemove);
      } else {
        throw new Error('Product to delete not found in the cart');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <Box my={4}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: theme.palette.title.primary }}
        >
          Shopping Cart
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <List>
              {cartItems.map((item, index) => (
                <ListItem key={`${item.product._id}-${index}`}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`Price per kg: $${
                      item.product.pricePerKg
                    }, Quantity: ${item.quantity}, Total: $${(
                      item.product.pricePerKg * item.quantity
                    ).toFixed(2)}`}
                  />
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteItem(item.product._id)}
                    sx={{ color: theme.palette.title.primary }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.title.primary }}
                >
                  Total: ${totalCost.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  bgcolor: theme.palette.background.secondary,
                  color: theme.palette.title.primary,
                }}
              >
                <Checkout cartId={cartId} />
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Box mb={4}>
        <Button
          component={Link}
          to="/products"
          startIcon={<ArrowBackIcon />}
          sx={{ color: theme.palette.title.primary }}
        >
          Back to products
        </Button>
      </Box>
    </Container>
  );
};

export default CartPage;



