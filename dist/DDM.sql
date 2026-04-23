-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema gerenciador_produtos
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema gerenciador_produtos
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gerenciador_produtos` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `gerenciador_produtos` ;

-- -----------------------------------------------------
-- Table `gerenciador_produtos`.`produtos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciador_produtos`.`produtos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `quantidade` INT NOT NULL,
  `quantidade_minima` INT NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `gerenciador_produtos`.`movimentacoes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciador_produtos`.`movimentacoes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `produto_id` INT NOT NULL,
  `produto_nome` VARCHAR(100) NOT NULL,
  `tipo` ENUM('Entrada', 'Saida') NOT NULL,
  `quantidade` INT NOT NULL,
  `data` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `produto_id` (`produto_id` ASC) VISIBLE,
  CONSTRAINT `movimentacoes_ibfk_1`
    FOREIGN KEY (`produto_id`)
    REFERENCES `gerenciador_produtos`.`produtos` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `gerenciador_produtos`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciador_produtos`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario` VARCHAR(50) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `usuario` (`usuario` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;