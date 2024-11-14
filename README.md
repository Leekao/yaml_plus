While working with Helm I noticed that a lot of times the way values files were being merged did not suit my needs.
I wanted my YAML files to be able to be merged easily and to have as little duplication as possible, Consider this situation:

`default-values.yaml` contains:
```
service_name:
  some_attribute_only_dev_should_have: "dev_value"
  ... a long list of other attributes dev & prod share (like image, env etc) ...
  some_array:
    - value for dev & prod
    - value for dev & prod
    - value for dev & prod
```
and `prod-values.yaml`:
```
service_name:
  some_attribute_only_prod_needs: "prod_value"
  ... a long list of other attributes dev & prod share (like image, env etc) ...
  some_array:
    - value for dev & prod
    - value for dev & prod
    - value for dev & prod
    - value only for prod  
```
Wouldn't it be easier if the prod-values.yaml didn't need to duplicate the long list of other attributes? 
With Yaml+ `prod-values.yaml` looks like this:
```
service_name+:
  -some_attribute_only_dev_should_have: 0
  some_attribute_only_prod_needs: "prod_value"
  some_array+:
    - value only for prod  
```
and this will create the same YAML as the previous example when you run `helm template`.
To install clone the repo and `helm plugin install ./yaml_plus`
