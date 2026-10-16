package com.buildo.repository;

import com.buildo.model.Category;
import com.buildo.model.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    List<Component> findByCategory(Category category);
    List<Component> findByCategoryAndInStockTrue(Category category);
    
    @Query("SELECT c FROM Component c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.brand) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.model) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Component> searchComponents(@Param("query") String query);
}
