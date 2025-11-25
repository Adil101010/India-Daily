package com.indiadaily.backend.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class Author {
    private String name;
    private String avatar;
    private String bio;
}
