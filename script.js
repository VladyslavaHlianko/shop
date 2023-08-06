let getProducts = async () => {
    let result = await fetch('https://634e9f834af5fdff3a625f84.mockapi.io/products', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json())
  
    result.forEach(el => {
      let categoryContainer = document.querySelector(`.${el.category.toLowerCase()}_cards`); 
      if (categoryContainer) {
        let template = document.getElementById(`${el.category.toLowerCase()}-card-template`);
        let clone = template.content.cloneNode(true);
        let img = clone.querySelector('.img');
        let title = clone.querySelector('.transport_name-title');
        let discont = clone.querySelector('.transport_discont-amount');
        let old_price = clone.querySelector('.old_price');
        let price = clone.querySelector('.price');
        let tr_discont = clone.querySelector('.transport_discont')
  
        img.src = `images/images/products/${el.img}.png`;
        title.innerText = el.title;
  
        if (el.sale) {
          discont.innerText = `-${el.salePercent}%`;
          old_price.innerText = `$${el.price}`;
          price.innerText = `$${el.price - (el.price * (el.salePercent / 100))}`;
        } else if (!el.sale) {
          tr_discont.style.display = 'none';
          price.innerText = `$${el.price}`;
        }

        let button = clone.querySelector('.product__cart');
        button.dataset.productId = el.id;
  
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.shoppingCart) {
        let existingProduct = loggedInUser.shoppingCart.some(item => item.id === el.id);
        if (existingProduct) {
          button.classList.add('product__cart-in');
        }
    }
        button.addEventListener('click', () => {
          addProduct(el, button);
        });
        categoryContainer.appendChild(clone); 
      }
      
    })
    
    return result;
  }

  getProducts();


let deleteProduct = async (userId, productId) => {
    try {
      let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      let shoppingCart = loggedInUser.shoppingCart;
  
      let updatedShoppingCart = shoppingCart.filter(item => item.id !== productId);
      loggedInUser.shoppingCart = updatedShoppingCart;
      

    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); 
  
      await updateUserData(userId, loggedInUser);
      updateCartItemCount(updatedShoppingCart.length); 
      console.log('Product deleted successfully');
      
      let row = document.querySelector(`tr[data-product-id="${productId}"]`);
      if (row) {
        row.parentNode.removeChild(row);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  let addProduct = async (product, button) => {
    try {
      let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
      if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
      }

      let existingProductIndex = loggedInUser.shoppingCart.findIndex(item => item.id === product.id);
      if (existingProductIndex !== -1) {
        button.classList.remove('product__cart-in');
        loggedInUser.shoppingCart.splice(existingProductIndex, 1);
        await deleteProduct(loggedInUser.id, product.id);
      } else {
        loggedInUser.shoppingCart.push({ id: product.id, count: 1 });
        button.classList.add('product__cart-in');
      }
  
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  
      await updateUserData(loggedInUser.id, loggedInUser);
      updateCartItemCount(loggedInUser.shoppingCart.length); 
      console.log('User updated successfully');

    } catch (error) {
      console.error('Error updating user:', error);
    }
  };


  let getUsers = async () => {
    return await fetch('https://634e9f834af5fdff3a625f84.mockapi.io/users', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then(res => res.json())
      .catch(error => {
        console.error('Помилка отримання користувачів:', error);
        throw error;
      });
  };

  

  function updateCartItemCount(count) {
    let basketElement = document.querySelector('.basket');
    basketElement.textContent = count;
  }
    
let create_User = async (obj) => {
    return await fetch('https://634e9f834af5fdff3a625f84.mockapi.io/users', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Помилка створення користувача');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Помилка створення користувача:', error);
        throw error;
      });
  }
  

let updateUserData = async (userId, newData) => {
    return await fetch(`https://634e9f834af5fdff3a625f84.mockapi.io/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then(response => response.json())
      .catch(error => {
        console.error('Помилка оновлення користувача:', error);
      });
  }
  

  getUsers().then(users => {
    let formSignIn = document.querySelector('.sign');
    let email_signIn = document.querySelector('.email_signIn');
    let password_signIn = document.querySelector('.password_signIn');
    let error = document.querySelector('.error');
  

    let formCreate = document.querySelector('.create');
    let verify_password = document.querySelector('#verify_password');
    let password = document.querySelector('#password');
    let errorCreate = document.querySelector('.errorCreate');
    let createEmail = document.querySelector('#createEmail');
    let createName = document.querySelector('#createName');

    if (formSignIn) {
      formSignIn.addEventListener('submit', async (event) => {
        event.preventDefault();
        let matchedUser = users.find(user => user.email === email_signIn.value);
  
        if (matchedUser === undefined) {
          error.style.display = 'block';
          error.innerHTML = 'Invalid email';
        } else if (matchedUser.password !== password_signIn.value) {
          error.style.display = 'block';
          error.innerHTML = 'Invalid password';
        } else {
          matchedUser.status = true;
          try {
            updateUserData(matchedUser.id, matchedUser);

            localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
            window.location.href = 'index.html';
          } catch (error) {
            console.error('Помилка оновлення користувача:', error);
          }
        }
      });
    }
  
if (formCreate) {
    formCreate.addEventListener('submit', (event) =>{
        event.preventDefault();

        
        let matchedUser = users.some(user => user.email === createEmail.value);
        if(password.value !== verify_password.value){
            errorCreate.style.display='block';
            errorCreate.innerHTML='Password not matches!';
        }
        else if(matchedUser){
            errorCreate.style.display='block';
            errorCreate.innerHTML=`User with email <${matchedUser.email}> already exist!`;
        } else{

            let newUser = {
                name: createName.value,
                password: password.value,
                email: createEmail.value,
                orders: [],
                shoppingCart: [],
                status: true
            }

            create_User(newUser)
            .then(() => {
                console.log('Користувач створений успішно');
                localStorage.setItem('loggedInUser', JSON.stringify(newUser));
                window.location.href = 'index.html';
            })
            .catch(err => console.error('Помилка створення користувача:', err));

        }
  })
}
});


let getProductsFromServer = async () => {
    let result = await fetch('https://634e9f834af5fdff3a625f84.mockapi.io/products', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json())
      .catch(error => {
        console.error('Помилка оновлення користувача:', error);
      });
  
    return result; 
  };
  
getUsers().then(users => {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.id) {
      let logged = users.find(user => user.id === loggedInUser.id);
      let table = document.querySelector('#table');
      let total = 0;
  
      if (logged.shoppingCart.length === 0) {
        table.style.display = 'none';
        return;
      }
      
      getProductsFromServer().then(products => {
        logged.shoppingCart.forEach(item => {
          let productId = item.id;
          let product = products.find(product => product.id === productId);
          if (product) {
            let newRow = document.createElement('tr');
            newRow.setAttribute('data-product-id', productId);
            newRow.innerHTML = `
              <td class="order-image">
                <img src="images/images/products/${product.img}.png" alt="" class="table_img">
                <p class="title-table">${product.title}</p>
              </td>
              <td>
                <p class="table_price">$${product.price}</p>
              </td>
              <td>
                ${product.sale ? `<p class="transport_discont-amount">-${product.salePercent}%</p>` : `<p>-</p>`}
              </td>
              <td> 
                <input value="${item.count}" class='number' type="number" min="1" max="100" step="1">
              </td>
              <td>
                ${product.sale ? `<p class="table_totalPrice">$${(product.price-(product.price*(product.salePercent/100))) * item.count}</p>` : `<p class="table_totalPrice">$${product.price * item.count}</p>`}
              </td>
              <td>
                <img class="table_input" width="20px" height="20px" src="images/images/delete.png" alt="Delete" data-product-id="${productId}">
              </td>
            `;
            table.appendChild(newRow);
  
            total += product.sale
              ? (product.price - (product.price * (product.salePercent / 100))) * item.count
              : product.price * item.count;
          }
        });
  
        let totalElement = document.querySelector('.total_price');
        totalElement.textContent = `$${total}`;
  
        let deleteButtons = document.querySelectorAll('.table_input');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
              let productId = button.getAttribute('data-product-id');
              deleteProduct(logged.id, productId);
          
              let totalPriceElement = button.parentNode.parentNode.querySelector('.table_totalPrice');
              let totalPrice = parseFloat(totalPriceElement.textContent.slice(1));
          
              if (!isNaN(totalPrice)) {
                total -= totalPrice;
                totalElement.textContent = `$${total.toFixed(1)}`;
              } else {
                console.error('Помилка отримання значення загальної суми');
              }
          
              table.removeChild(button.parentNode.parentNode);
            });
          });
          
          let inputFields = document.querySelectorAll('.number');
          inputFields.forEach(input => {
            input.addEventListener('input', () => {
              let productId = input.parentNode.parentNode.getAttribute('data-product-id');
              let product = products.find(product => product.id === productId);
              let quantity = parseInt(input.value);
              
              if (!isNaN(quantity)) {
                let totalPriceElement = input.parentNode.nextElementSibling.querySelector('.table_totalPrice');
                let totalPrice = 0;
            
                if (product.sale) {
                  totalPrice = (product.price - (product.price * (product.salePercent / 100))) * quantity;
                } else {
                  totalPrice = product.price * quantity;
                }
            
                if (!isNaN(totalPrice)) {
                  total -= parseFloat(totalPriceElement.textContent.slice(1));
                  total += totalPrice;
                  totalElement.textContent = `$${total.toFixed(1)}`;
                  totalPriceElement.textContent = `$${totalPrice.toFixed(1)}`;

                  logged.shoppingCart.forEach(item => {
                    if (item.id === productId) {
                      item.count = quantity;
                    }
                  });
                  localStorage.setItem('loggedInUser', JSON.stringify(logged));
                  updateUserData(logged.id, logged);
                } else {
                  console.error('Помилка розрахунку загальної суми');
                }
              } else {
                console.error('Помилка отримання значення кількості товару');
              }
            });
          });          

      });
    }
  });
  
  
  
  
  

let log_out = document.querySelector('.log_out');
let log_in = document.querySelector('.log_in');
let basket = document.querySelector('.basket_link');

window.addEventListener('load', () => {
    let info_name = document.querySelector('.info_name');
    let info_email = document.querySelector('.info_email');
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let table_order = document.querySelector('.table_order');
    if (loggedInUser) {
      updateCartItemCount(loggedInUser.shoppingCart.length);
      log_out.style.display = 'block';
      log_in.innerText = loggedInUser.name;
      log_in.href = 'account.html';
      basket.href = 'shoppingCart.html';
      if(loggedInUser.orders.length === 0){
        table_order.style.display = 'none';
      }
      info_name.innerHTML = `${loggedInUser.name}`;
      info_email.innerHTML = `${loggedInUser.email}`;
    }
    

  });

    log_out.addEventListener('click', ()=>{
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        loggedInUser.status = false;
    
        updateUserData(loggedInUser.id, loggedInUser)
        .then(() => {
            console.log('Користувач оновлений успішно');
            window.location.href = 'index.html';
        }).catch(error => {
            console.error('Помилка оновлення користувача:', error);
        });
        
        localStorage.clear();
    })



    let deleteUser = async (id) => {
        let result = await fetch(`https://634e9f834af5fdff3a625f84.mockapi.io/users/${id}`, {
        method: 'DELETE',
        }).then(res => res)
    }
  
    document.addEventListener('DOMContentLoaded', () => {
        let btn_delete = document.querySelector('.btn_delete');
    
        if (localStorage.getItem('loggedInUser')) {
            btn_delete.addEventListener('click', () => {
                let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                deleteUser(loggedInUser.id)
                    .then(() => {
                        localStorage.clear();
                        window.location.href = 'index.html';
                    })
                    .catch(err => console.error('Помилка створення користувача:', err));
            });
        }
    });
    




      let getProductServer = async () => {
        try {
          const response = await fetch('https://634e9f834af5fdff3a625f84.mockapi.io/products', {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
            }
          });
        
          if (response.ok) {
            const result = await response.json();
            return result;
          } else {
            console.error('Помилка отримання даних:', response.status);
            return [];
          }
        } catch (error) {
          console.error('Помилка отримання даних:', error);
          return [];
        }
      }
      
      document.addEventListener('DOMContentLoaded', async () => {
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const tableOrder = document.querySelector('.table_order');
      
        let orders = loggedInUser?.orders || [];
      
        if (orders.length === 0) {
          console.log('Orders is empty');
          return;
        } else {
          await executeSecondCode();
          console.log('Success');
        }
      
        async function executeSecondCode() {
          const products = await getProductServer();
      
          orders.forEach(item => {
            const orderId = item.id;
            const product = products.find(product => product.id === orderId);
      
            if (product) {
              const newRow = document.createElement('tr');
              newRow.setAttribute('data-product-id', orderId);
      
              newRow.innerHTML = `
                <td class="order-image">
                  <img width="100px" height="100px" src="images/images/products/${product.img}.png" alt="">
                  <p>${product.title}</p>
                </td>
                <td>
                  <p>$${product.price}</p>
                </td>
                <td>
                ${product.sale ? `<p class="transport_discont-amount">-${product.salePercent}%</p>` : `<p>-</p>`}
                </td>
                <td>
                  <p>${item.count}</p>
                </td>
                <td>
                  <p>$${product.price * item.count}</p>
                </td>
              `;
      
              tableOrder.appendChild(newRow);
            }
          });
        }
      });
      
      const completeOrderBtn = document.querySelector('.order_btn');

completeOrderBtn.addEventListener('click', async () => {
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  let shoppingCart = loggedInUser.shoppingCart;

  if (shoppingCart.length === 0) {
    console.log('Shopping cart is empty');
    return;
  }

  loggedInUser.orders = [...shoppingCart];
  loggedInUser.shoppingCart = [];
  localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  await updateUserData(loggedInUser.id, loggedInUser);

  console.log('Order completed successfully');
  window.location.href = 'account.html';
});