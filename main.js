//template renderiza o shape HTML
//data() { return {..main data..} } data que retorna o data principal
//methods e computed ficam fora do data(){return{...}}
//"product" sera a palavra chave q usaremos no index.html <product>
//isso irar renderizar todo o sistema do nosso app

Vue.config.devtools = true; // this line is to allow the vue devtools

const eventBus = new Vue()

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true,
    },
  },

  template: `
      <div class="row">
        <div class="col-6 p-5">
          <div class="product">
            <div class="product-img">
              <img :src="img" />
            </div>
          </div>
        </div>

        <div class="col-6 p-5">
          <div class="product-info">
            <h1>{{title}}</h1>
            <!-- <h5>{{description}}</h5> -->
            <p v-if="inStock" id="in">InStock</p>
            <p v-else :class="{disabledBtn: !inStock}" id="out">Out of Stock</p>
            <p>Shipping {{shipping}}</p>

            <ul>
              <li v-for="detail in ingredients">{{ detail }}</li>
            </ul>

            <!-- v-for renderiza elementos de uma array -->

            <div
              class="color-box"
              v-for="(variant, index) in variants"
              :key="variant.variantId"
              :style="{backgroundColor: variant.variantColor}"
              @mouseover="updateProduct(index)"
            ></div>

            <button
            id="sub"
              v-on:click="addToCart"
              :disabled="!inStock"
              :class="{disabledBtn: !inStock}"
              class="btn btn-danger"
            >
              Add to cart
            </button>

          </div>
        </div>

        <product-tabs :reviews="reviews"></product-tabs>
        
      </div>
  `,

  data() {
    return {
      product: "Cris Condimentos",
      brand: "O melhor Tempero caseiro do Litoral",
      selectedVariant: 0,
      href: "https://www.instagram.com/condimentoscris/",
      ingredients: [
        "Sal",
        "Açafrão",
        "Cominho",
        "Noz moscada",
        "Folha de louro em pó",
        "Quioio",
        "Alho",
        "Cebola",
        "Oregano",
        "Alegrim",
      ],
      variants: [
        {
          variantId: 1,
          variantColor: "brown",
          variantImage: "./img/tompero.png",
          variantQuantity: 0,
        },
        {
          variantId: 2,
          variantColor: "red",
          variantImage: "./img/tempero.jpeg",
          variantQuantity: 10,
        },
      ],
      reviews: [],
    };
  },

  methods: {
    // methods tem functions que interage com data e com o html tipo uma ponte entre eles
    // ta emitindo funcionalidade de add to cart
    addToCart() {
      // esse Id entra no variants que entra o variantId q passa pelo
      // method e updateCart
      this.$emit("add-to-cart", this.variants[this.selectedVariant].variantId);
    },

    updateProduct(index) {
      this.selectedVariant = index;
    },
  },

  computed: {
    // renderiza o Title
    title() {
      return this.product + " " + this.brand;
    },
    // atualiza a img
    img() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    shipping() {
      if (this.premium) {
        return "Free";
      }
      return "$ 2.99";
    },
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview);
    })
  },
});

Vue.component("product-review", {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p class="error" v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name">
      </p>

      <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

    <label for="recommend">Would you recommend this product?</label>
      <select id="recommend" v-model="recommend">
        <option>Yes</option>
        <option>No</option>
      </select>

      
        <input id="sub" class="btn" type="submit" value="Submit">
      

    </form>
  `,

  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: [],
      recommend: null
    };
  },

  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        };
        eventBus.$emit("review-submitted", productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null
      } else {
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("review required.");
        if (!this.rating) this.errors.push("Rating required.");
      }
    },
  },
});

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  
  template: `
 <div class="container">
  <div class="tab">
      <span class="tab" 
        :class="{ activeTab: selectedTab === tab }" 
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectedTab = tab">{{ tab }}</span>
  
    <div v-show="selectedTab === 'Reviews'">
      <p v-if="!reviews.length">There are no reviews yet.</p>
      <ul v-else>
        <li v-for="(review, index) in reviews" :key="index">
          <p>{{ review.name }}</p>
          <p>Rating: {{ review.rating }}</p>
          <p>{{ review.review }}</p>
        </li>
      </ul>
    </div>

    <product-review :class="selectedTab === 'Make a review'">
    </product-review>

  </div>
 </div>
  `,

  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  },
})

const app = new Vue({
  // perceba q #app, premium, cart, updateCart estão sendo usados no HTML
  el: "#app",
  data: {
    premium: false,
    cart: [],
  },
  methods: {
    // a lógica de add to cart
    updateCart(id) {
      this.cart.push(id);
    },
  },
});
