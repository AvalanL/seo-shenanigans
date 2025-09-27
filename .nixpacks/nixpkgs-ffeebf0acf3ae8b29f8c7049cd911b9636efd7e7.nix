let
  nixpkgsSrc = builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.tar.gz";
  };
  npmOverlay = import (builtins.fetchTarball {
    url = "https://github.com/railwayapp/nix-npm-overlay/archive/main.tar.gz";
  });
  pkgs = import nixpkgsSrc {
    overlays = [ npmOverlay ];
  };
in
pkgs.buildEnv {
  name = "ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env";
  paths = [
    pkgs.bashInteractive
    pkgs.cacert
    pkgs.coreutils
    pkgs.findutils
    pkgs.gitMinimal
    pkgs.gnutar
    pkgs.gzip
    pkgs.jq
    pkgs.nodePackages_latest.npm
    pkgs.nodePackages_latest.pnpm
    pkgs.nodePackages_latest.yarn
    pkgs.openssh
    pkgs.procps
    pkgs.python311
    pkgs.unzip
    pkgs.which
    pkgs.zip
    pkgs."nodejs-20_x"
  ];
}
