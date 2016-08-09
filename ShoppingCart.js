angular.module('services.cart', [])
    .service("Cart", ["$rootScope", "Reviewer", function ($rootScope, Reviewer) {
        if (!window.localStorage) {
            throw new Error("Local storage not supported");
        }
        else {
            window.localStorage.setItem("Cart", JSON.stringify({}));
        }
        var shopCart;
        if (localStorage.getItem("Cart"))
            shopCart = JSON.parse(localStorage.getItem("Cart"));
        else
            shopCart = {};
        return {
            getCart: function () {
                return shopCart;
            },

            addItem: function (product) {
                if (!product) {
                    throw new Error("Product is not defined");
                }
                if (!product.id) {
                    throw new Error("Product id is not defined")
                }

                if (!product.qty) {
                    throw new Error("Product quantity is not defined or 0")
                }

                if (shopCart[product.id])
                    throw new Error("product already exist");
                else
                    shopCart[product.id] = product.qty;
                this.save();
            },

            addItems: function (productList) {
                if (!productList || productList.length <= 0) {
                    throw new Error("Product list is empty or not defined");
                }
                var that = this;
                $.each(productList, function (index, obj) {
                    that.addItem(obj);
                });
            },

            save: function () {
                var that = this;
                var cart = this.getCart();
                Reviewer.review(Cart).then(function (data) {
                    that.persist();
                    that.refresh();
                }, function (err) {
                    console.log("received Error from Reviewer : " + err);
                });
            },

            remove: function (ID) {
                if (!ID) {
                    throw new Error("ID is undefined");
                }
                delete shopCart[ID];
                this.save();
            },

            clear: function () {
                shopCart = {};
                this.save();
            },

            persist: function () {
                localStorage.setItem("Cart", JSON.stringify(shopCart));

            },
            refresh: function () {
                $rootScope.$broadcast("Cart-refreshed");
            },

            changeQuantity: function (product) {
                if (!product) {
                    throw new Error("Product is not defined");
                }
                if (!product.id) {
                    throw new Error("Product id is not defined")
                }
                if (!product.qty) {
                    throw new Error("Product quantity is not defined or 0")
                }
                if (shopCart[product.id]) {
                    if (product.qty > 0)
                        shopCart[product.id] = product.qty;
                    else
                        this.remove(product.id);
                }
                else {
                    throw new Error("Product id does not exist in the cart");
                }
            }
        }

    }]);
