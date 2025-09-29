import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyADWA_GzVPXiKMXR-YPi0lwVuXZBcaV59Q",
  authDomain: "cardapio-acai-4f997.firebaseapp.com",
  projectId: "cardapio-acai-4f997",
  storageBucket: "cardapio-acai-4f997.appspot.com",
  messagingSenderId: "746182323049",
  appId: "1:746182323049:web:b509973f86879bbcdcebf8",
  measurementId: "G-X1465Q6EFL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;

let masterAddOns = []; // Guarda a lista mestra de adicionais

// --- GERENCIAMENTO DE PRODUTOS ---
const productForm = document.getElementById('product-form');
const productListBody = document.getElementById('product-list-body');
const productAddonsChecklist = document.getElementById('product-addons-checklist');

const getProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    productListBody.innerHTML = '';
    snapshot.forEach(doc => {
        const product = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="product-thumbnail"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="window.editProduct('${doc.id}')">Editar</button>
                <button class="btn btn-delete" onclick="window.deleteProduct('${doc.id}')">Excluir</button>
            </td>
        `;
        productListBody.appendChild(tr);
    });
};

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const image = document.getElementById('product-image').value;

    // Pega os IDs dos adicionais marcados
    const selectedAddOnCheckboxes = document.querySelectorAll('#product-addons-checklist input:checked');
    const availableAddOnIds = Array.from(selectedAddOnCheckboxes).map(cb => cb.value);

    if (!name || !price || !category || !image) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const productData = { name, price, category, description, image, availableAddOnIds };

    if (id) {
        await updateDoc(doc(db, 'products', id), productData);
        alert('Produto atualizado com sucesso!');
    } else {
        await addDoc(collection(db, 'products'), productData);
        alert('Produto cadastrado com sucesso!');
    }
    
    productForm.reset();
    document.getElementById('product-id').value = '';
    renderAddOnsChecklist(); // Limpa os checkboxes
    getProducts();
});

window.editProduct = async (id) => {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
        const product = docSnap.data();
        document.getElementById('product-id').value = id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image;
        
        renderAddOnsChecklist(product.availableAddOnIds || []);
        
        window.scrollTo(0, 0);
    }
};

window.deleteProduct = async (id) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await deleteDoc(doc(db, 'products', id));
        getProducts();
    }
};

// --- GERENCIAMENTO DE ADICIONAIS ---
const addonForm = document.getElementById('addon-form');
const addonListBody = document.getElementById('addon-list-body');

const getAddOns = async () => {
    const snapshot = await getDocs(collection(db, 'addOns'));
    addonListBody.innerHTML = '';
    masterAddOns = [];
    snapshot.forEach(doc => {
        const addon = doc.data();
        addon.id = doc.id;
        masterAddOns.push(addon);

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${addon.name}</td><td>${formatCurrency(addon.price)}</td><td class="actions"><button class="btn btn-edit" onclick="window.editAddOn('${doc.id}')">Editar</button><button class="btn btn-delete" onclick="window.deleteAddOn('${doc.id}')">Excluir</button></td>`;
        addonListBody.appendChild(tr);
    });
    renderAddOnsChecklist();
};

function renderAddOnsChecklist(selectedIds = []) {
    productAddonsChecklist.innerHTML = '';
    masterAddOns.sort((a,b) => a.name.localeCompare(b.name));
    masterAddOns.forEach(addon => {
        const isChecked = selectedIds.includes(addon.id) ? 'checked' : '';
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${addon.id}" ${isChecked}> ${addon.name}`;
        productAddonsChecklist.appendChild(label);
    });
}

addonForm.addEventListener('submit', async (e) => { e.preventDefault(); const id = document.getElementById('addon-id').value; const name = document.getElementById('addon-name').value; const price = parseFloat(document.getElementById('addon-price').value); if (!name || isNaN(price)) { alert('Preencha todos os campos corretamente.'); return; } const addonData = { name, price }; if (id) { await updateDoc(doc(db, 'addOns', id), addonData); } else { await addDoc(collection(db, 'addOns'), addonData); } addonForm.reset(); document.getElementById('addon-id').value = ''; getAddOns(); });
window.editAddOn = async (id) => { const docSnap = await getDoc(doc(db, 'addOns', id)); if (docSnap.exists()) { const addon = docSnap.data(); document.getElementById('addon-id').value = id; document.getElementById('addon-name').value = addon.name; document.getElementById('addon-price').value = addon.price; } };
window.deleteAddOn = async (id) => { if (confirm('Tem certeza que deseja excluir este adicional?')) { await deleteDoc(doc(db, 'addOns', id)); getAddOns(); } };


// --- GERENCIAMENTO DE TAXAS DE ENTREGA ---
const feeForm = document.getElementById('fee-form');
const feeListBody = document.getElementById('fee-list-body');
// ... (funções de gerenciamento de frete permanecem as mesmas)
const getDeliveryFees = async () => { const snapshot = await getDocs(collection(db, 'deliveryFees')); feeListBody.innerHTML = ''; snapshot.forEach(doc => { const fee = doc.data(); const tr = document.createElement('tr'); tr.innerHTML = `<td>${fee.neighborhood}</td><td>${formatCurrency(fee.fee)}</td><td class="actions"><button class="btn btn-edit" onclick="window.editFee('${doc.id}')">Editar</button><button class="btn btn-delete" onclick="window.deleteFee('${doc.id}')">Excluir</button></td>`; feeListBody.appendChild(tr); }); };
feeForm.addEventListener('submit', async (e) => { e.preventDefault(); const id = document.getElementById('fee-id').value; const neighborhood = document.getElementById('fee-neighborhood').value; const fee = parseFloat(document.getElementById('fee-value').value); if (!neighborhood || isNaN(fee)) { alert('Preencha todos os campos.'); return; } const feeData = { neighborhood, fee }; if (id) { await updateDoc(doc(db, 'deliveryFees', id), feeData); } else { await addDoc(collection(db, 'deliveryFees'), feeData); } feeForm.reset(); document.getElementById('fee-id').value = ''; getDeliveryFees(); });
window.editFee = async (id) => { const docSnap = await getDoc(doc(db, 'deliveryFees', id)); if (docSnap.exists()) { const fee = docSnap.data(); document.getElementById('fee-id').value = id; document.getElementById('fee-neighborhood').value = fee.neighborhood; document.getElementById('fee-value').value = fee.fee; } };
window.deleteFee = async (id) => { if (confirm('Tem certeza que deseja excluir esta taxa de entrega?')) { await deleteDoc(doc(db, 'deliveryFees', id)); getDeliveryFees(); } };


// --- INICIALIZAÇÃO ---
async function initAdmin() {
    await getAddOns(); // Precisa carregar os adicionais primeiro
    getProducts();
    getDeliveryFees();
}

initAdmin();