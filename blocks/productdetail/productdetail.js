import { getProduct, createTag } from "../../utils/utils.js";

export default async function decorate(block) {
    const container = block.children[0];
    const productID = container.children[0].innerHTML;
    const product = await getProduct(productID);
    if (product) { 
        let titleTag = createTag('h5', {}, product['Title']);
        container.appendChild(titleTag);

        let imgTag = createTag('img', 
           {
            src: product['Image URL'],
            width: '966',
            height: '966',
           });
        container.appendChild(imgTag);

        let priceTag = createTag('p', {}, '$' + product['Price'] + ' | ' + product['Source']);
        container.appendChild(priceTag);
        
        let buttonLinkTag = createTag('a', {
            href: product['Product URL'],
            title: product['Product URL'],
            class: 'button primary'
           }, 'BUY NOW');
        let buttonContainerTag = createTag('p', {class: 'button-container'}, buttonLinkTag);
        container.appendChild(buttonContainerTag);
    } else {
        container.children[0].innerHTML = 'Product ' + productID + ' not found!';
    }
}