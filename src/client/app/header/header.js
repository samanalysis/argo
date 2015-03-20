"use strict";

(function () {
    angular
        .module("argo")
        .controller("Header", Header);

    Header.$inject = ["$mdDialog", "$mdBottomSheet", "toastService",
        "accountsService", "sessionService"];

    function Header($mdDialog, $mdBottomSheet, toastService,
                    accountsService, sessionService) {
        var vm = this;

        vm.openTokenDialog = function (event) {
            $mdDialog.show({
                controller: "TokenDialog",
                controllerAs: "vm",
                templateUrl: "app/header/token-dialog.html",
                targetEvent: event
            }).then(function (tokenInfo) {
                if (tokenInfo) {
                    vm.environment = tokenInfo.environment;
                    vm.token = tokenInfo.token;
                } else {
                    vm.environment = "";
                    vm.token = "";
                    vm.accountId = "";
                }

                accountsService.getAccounts({
                    environment: vm.environment,
                    token: vm.token
                }).then(function (accounts) {
                    $mdBottomSheet.show({
                        controller: "AccountsBottomSheet",
                        controllerAs: "sheet",
                        templateUrl: "app/account/accounts-bottomsheet.html",
                        locals: {accounts: accounts},
                        targetEvent: event
                    }).then(function (accountSelected) {
                        vm.accountId = accountSelected.accountId;

                        sessionService.setCredentials({
                            environment: vm.environment,
                            token: vm.token,
                            accountId: vm.accountId
                        });

                        accountsService.getAccounts({
                            environment: vm.environment,
                            token: vm.token,
                            accountId: vm.accountId
                        }).then(function (account) {
                            vm.account = account;
                        });
                    });
                }, function (err) {
                    toastService.show(err);
                });
            });
        };
    }
}());
